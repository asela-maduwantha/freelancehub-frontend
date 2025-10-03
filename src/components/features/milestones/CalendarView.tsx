'use client';

import React, { useState, useMemo } from 'react';
import { MilestoneResponse } from '@/lib/api/milestones';
import { Badge } from '@/components/ui/Display';

interface CalendarViewProps {
  milestones: MilestoneResponse[];
  onMilestoneClick: (milestone: MilestoneResponse) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ milestones, onMilestoneClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get first and last day of the month
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  // Get the day of week for the first day (0 = Sunday, 6 = Saturday)
  const startingDayOfWeek = firstDayOfMonth.getDay();
  
  // Calculate how many days to show from previous month
  const daysFromPrevMonth = startingDayOfWeek;
  
  // Calculate calendar grid
  const calendarDays = useMemo(() => {
    const days = [];
    const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
    
    // Previous month days
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      days.push({
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      });
    }
    
    // Current month days
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      days.push({
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i),
        isCurrentMonth: true,
      });
    }
    
    // Next month days to fill the grid (6 rows x 7 days = 42)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i),
        isCurrentMonth: false,
      });
    }
    
    return days;
  }, [currentDate]);

  // Get milestones for a specific date
  const getMilestonesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return milestones.filter(m => {
      const milestoneDateStr = m.dueDate.split('T')[0];
      return milestoneDateStr === dateStr;
    });
  };

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Navigation handlers
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-blue-500';
      case 'submitted':
        return 'bg-yellow-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Calendar Header */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {milestones.length} milestones this month
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Today
            </button>
            <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-gray-50 rounded-l-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-50 rounded-r-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {/* Week Day Headers */}
        <div className="grid grid-cols-7 gap-px mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center py-3 text-sm font-semibold text-gray-600 uppercase tracking-wide"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
          {calendarDays.map((day, index) => {
            const dayMilestones = getMilestonesForDate(day.date);
            const isTodayDate = isToday(day.date);

            return (
              <div
                key={index}
                className={`
                  bg-white min-h-[120px] p-2
                  ${!day.isCurrentMonth ? 'bg-gray-50' : ''}
                  ${isTodayDate ? 'bg-blue-50 ring-2 ring-blue-500 ring-inset' : ''}
                  hover:bg-gray-50 transition-colors
                `}
              >
                {/* Day Number */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`
                      text-sm font-semibold
                      ${!day.isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
                      ${isTodayDate ? 'bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center' : ''}
                    `}
                  >
                    {day.date.getDate()}
                  </span>
                  {dayMilestones.length > 0 && (
                    <span className="text-xs font-medium text-gray-500">
                      {dayMilestones.length}
                    </span>
                  )}
                </div>

                {/* Milestones */}
                <div className="space-y-1">
                  {dayMilestones.slice(0, 3).map((milestone) => (
                    <button
                      key={milestone.id}
                      onClick={() => onMilestoneClick(milestone)}
                      className="w-full text-left p-1.5 rounded text-xs hover:shadow-sm transition-shadow group"
                      style={{
                        backgroundColor: `${getStatusColor(milestone.status)}15`,
                        borderLeft: `3px solid`,
                        borderColor: getStatusColor(milestone.status).replace('bg-', '#'),
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(milestone.status)} flex-shrink-0`} />
                        <span className="truncate font-medium text-gray-900 group-hover:text-primary">
                          {milestone.title}
                        </span>
                      </div>
                      <div className="text-gray-600 mt-0.5 truncate">
                        ${milestone.amount.toLocaleString()}
                      </div>
                    </button>
                  ))}
                  {dayMilestones.length > 3 && (
                    <button className="w-full text-center text-xs text-gray-500 hover:text-primary py-1 font-medium">
                      +{dayMilestones.length - 3} more
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400" />
            <span className="text-gray-600">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-gray-600">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-gray-600">Submitted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-600">Approved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-gray-600">Rejected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
