'use client';

import React from 'react';
import { MilestoneResponse } from '@/lib/api/milestones';
import { MilestonePosition, getMilestoneStatusColor } from '@/lib/utils/timelineUtils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface MilestoneBarProps {
  milestone: MilestoneResponse;
  position: MilestonePosition;
  onClick: (milestone: MilestoneResponse) => void;
  onDragEnd: (milestoneId: string, newDueDate: Date) => void;
}

const MilestoneBar: React.FC<MilestoneBarProps> = ({
  milestone,
  position,
  onClick,
  onDragEnd,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `milestone-${milestone.id}`,
    data: {
      type: 'milestone',
      milestone,
      position,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const colors = getMilestoneStatusColor(milestone.status, position.isOverdue);

  const getStatusIcon = () => {
    switch (milestone.status) {
      case 'approved':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'in-progress':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      case 'submitted':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        left: `${position.left}px`,
        width: `${position.width}px`,
      }}
      className={`
        absolute cursor-pointer transition-all duration-200 group
        ${isDragging ? 'opacity-50 z-50' : 'z-10'}
      `}
      {...attributes}
      {...listeners}
      onClick={() => onClick(milestone)}
    >
      <div
        className={`
          ${colors.bg} ${colors.border} ${colors.text}
          border-2 rounded-lg px-3 py-2 shadow-sm
          hover:shadow-md hover:scale-[1.02] transition-all duration-200
          ${isDragging ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}
        `}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex-shrink-0">
              {getStatusIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">
                #{milestone.order} {milestone.title}
              </div>
              {position.width > 150 && (
                <div className="text-xs opacity-90 truncate">
                  {milestone.description}
                </div>
              )}
            </div>
          </div>
          <div className="flex-shrink-0 font-bold text-sm">
            ${milestone.amount.toLocaleString()}
          </div>
        </div>

        {/* Overdue Badge */}
        {position.isOverdue && milestone.status !== 'approved' && (
          <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-medium shadow-md">
            Overdue
          </div>
        )}

        {/* Drag Handle Indicator */}
        <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-50 transition-opacity">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default MilestoneBar;
