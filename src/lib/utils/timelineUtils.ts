import { MilestoneResponse } from '@/lib/api/milestones';

export type TimelineZoom = 'week' | 'month' | 'quarter';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface TimelineColumn {
  date: Date;
  label: string;
  isToday: boolean;
  isWeekend: boolean;
}

export interface MilestonePosition {
  left: number;
  width: number;
  startDate: Date;
  endDate: Date;
  isOverdue: boolean;
}

export interface ProjectSwimlane {
  contractId: string;
  contractTitle: string;
  milestones: MilestoneResponse[];
  totalValue: number;
  completedValue: number;
  completionPercentage: number;
}

/**
 * Calculate the date range for the timeline based on zoom level
 */
export function calculateDateRange(zoom: TimelineZoom, centerDate: Date = new Date()): DateRange {
  const start = new Date(centerDate);
  const end = new Date(centerDate);

  switch (zoom) {
    case 'week':
      // Show 4 weeks before and after center date
      start.setDate(start.getDate() - 28);
      end.setDate(end.getDate() + 28);
      break;
    case 'month':
      // Show 3 months before and after center date
      start.setMonth(start.getMonth() - 3);
      end.setMonth(end.getMonth() + 3);
      break;
    case 'quarter':
      // Show 2 quarters before and after center date
      start.setMonth(start.getMonth() - 6);
      end.setMonth(end.getMonth() + 6);
      break;
  }

  // Set to start of day for start date, end of day for end date
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

/**
 * Generate timeline columns based on zoom level and date range
 */
export function generateTimelineColumns(dateRange: DateRange, zoom: TimelineZoom): TimelineColumn[] {
  const columns: TimelineColumn[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const current = new Date(dateRange.start);

  while (current <= dateRange.end) {
    const isToday = current.getTime() === today.getTime();
    const isWeekend = current.getDay() === 0 || current.getDay() === 6;

    let label = '';
    switch (zoom) {
      case 'week':
        label = current.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
        break;
      case 'month':
        label = current.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
        break;
      case 'quarter':
        label = current.toLocaleDateString('en-US', {
          month: 'short',
          year: '2-digit'
        });
        break;
    }

    columns.push({
      date: new Date(current),
      label,
      isToday,
      isWeekend
    });

    // Increment based on zoom level
    switch (zoom) {
      case 'week':
        current.setDate(current.getDate() + 1);
        break;
      case 'month':
        current.setDate(current.getDate() + 1);
        break;
      case 'quarter':
        current.setDate(current.getDate() + 7); // Weekly columns for quarter view
        break;
    }
  }

  return columns;
}

/**
 * Calculate the position and width of a milestone bar on the timeline
 */
export function calculateMilestonePosition(
  milestone: MilestoneResponse,
  dateRange: DateRange,
  totalWidth: number
): MilestonePosition {
  const timelineDuration = dateRange.end.getTime() - dateRange.start.getTime();

  // Use created date as start if no specific start date
  const startDate = milestone.createdAt ? new Date(milestone.createdAt) : new Date();
  const endDate = new Date(milestone.dueDate);

  // Ensure dates are within range
  const clampedStart = new Date(Math.max(startDate.getTime(), dateRange.start.getTime()));
  const clampedEnd = new Date(Math.min(endDate.getTime(), dateRange.end.getTime()));

  const startOffset = clampedStart.getTime() - dateRange.start.getTime();
  const duration = clampedEnd.getTime() - clampedStart.getTime();

  const left = (startOffset / timelineDuration) * totalWidth;
  const width = Math.max((duration / timelineDuration) * totalWidth, 40); // Minimum width of 40px

  const now = new Date();
  const isOverdue = endDate < now && milestone.status !== 'approved' && milestone.status !== 'paid';

  return {
    left: Math.max(0, left),
    width: Math.min(width, totalWidth - left),
    startDate: clampedStart,
    endDate: clampedEnd,
    isOverdue
  };
}

/**
 * Get color classes for milestone status
 */
export function getMilestoneStatusColor(status: string, isOverdue: boolean = false): {
  bg: string;
  border: string;
  text: string;
} {
  if (isOverdue) {
    return {
      bg: 'bg-red-100',
      border: 'border-red-300',
      text: 'text-red-800'
    };
  }

  switch (status) {
    case 'pending':
      return {
        bg: 'bg-gray-100',
        border: 'border-gray-300',
        text: 'text-gray-800'
      };
    case 'in-progress':
      return {
        bg: 'bg-blue-100',
        border: 'border-blue-300',
        text: 'text-blue-800'
      };
    case 'submitted':
      return {
        bg: 'bg-yellow-100',
        border: 'border-yellow-300',
        text: 'text-yellow-800'
      };
    case 'approved':
      return {
        bg: 'bg-green-100',
        border: 'border-green-300',
        text: 'text-green-800'
      };
    case 'rejected':
      return {
        bg: 'bg-red-100',
        border: 'border-red-300',
        text: 'text-red-800'
      };
    default:
      return {
        bg: 'bg-gray-100',
        border: 'border-gray-300',
        text: 'text-gray-800'
      };
  }
}

/**
 * Group milestones by contract/project
 */
export function groupMilestonesByContract(
  milestones: MilestoneResponse[],
  contracts: any[]
): ProjectSwimlane[] {
  const contractMap = new Map(contracts.map(c => [c._id, c]));

  const grouped = milestones.reduce((acc, milestone) => {
    // Handle both string contractId and populated object contractId
    let contractId: string;
    let contractTitle = 'Unknown Project';
    
    if (typeof milestone.contractId === 'object' && milestone.contractId !== null) {
      // contractId is populated as an object (from milestones endpoint)
      contractId = (milestone.contractId as any)._id || (milestone.contractId as any).id || 'unknown';
      contractTitle = (milestone.contractId as any).title || 'Unknown Project';
    } else if (typeof milestone.contractId === 'string') {
      // contractId is just a string ID (need to lookup)
      contractId = milestone.contractId;
      const contract = contractMap.get(contractId);
      if (contract) {
        // Check if jobId is an object with title
        if (contract.jobId && typeof contract.jobId === 'object' && contract.jobId.title) {
          contractTitle = contract.jobId.title;
        } else if (contract.title) {
          contractTitle = contract.title;
        }
      }
    } else {
      contractId = 'unknown';
    }

    if (!acc.has(contractId)) {
      acc.set(contractId, {
        contractId,
        contractTitle,
        milestones: [],
        totalValue: 0,
        completedValue: 0,
        completionPercentage: 0
      });
    }
    acc.get(contractId)!.milestones.push(milestone);
    return acc;
  }, new Map<string, ProjectSwimlane>());

  // Calculate totals and completion percentages
  return Array.from(grouped.values()).map(swimlane => {
    const totalValue = swimlane.milestones.reduce((sum, m) => sum + m.amount, 0);
    const completedValue = swimlane.milestones
      .filter(m => m.status === 'approved')
      .reduce((sum, m) => sum + m.amount, 0);
    const completionPercentage = totalValue > 0 ? (completedValue / totalValue) * 100 : 0;

    return {
      ...swimlane,
      totalValue,
      completedValue,
      completionPercentage
    };
  });
}

/**
 * Check if a milestone requires user action based on role
 */
export function requiresUserAction(milestone: MilestoneResponse, userRole: 'client' | 'freelancer'): boolean {
  if (userRole === 'freelancer') {
    return milestone.status === 'pending' || milestone.status === 'in-progress';
  } else {
    return milestone.status === 'submitted';
  }
}

/**
 * Get milestones due within a specific number of days
 */
export function getMilestonesDueWithin(milestones: MilestoneResponse[], days: number): MilestoneResponse[] {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(now.getDate() + days);

  return milestones.filter(milestone => {
    const dueDate = new Date(milestone.dueDate);
    return dueDate >= now && dueDate <= futureDate && milestone.status !== 'approved';
  });
}

/**
 * Format currency consistently
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Get day name for a date
 */
export function getDayName(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

/**
 * Check if date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

/**
 * Calculate days until due date
 */
export function getDaysUntilDue(dueDate: Date): number {
  const now = new Date();
  const diffTime = dueDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}