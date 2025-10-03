'use client';

import React from 'react';
import { MilestoneResponse } from '@/lib/api/milestones';
import {
  TimelineColumn,
  MilestonePosition,
  ProjectSwimlane as ProjectSwimlaneType,
  calculateMilestonePosition,
} from '@/lib/utils/timelineUtils';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import MilestoneBar from './MilestoneBar';

interface ProjectSwimlaneProps {
  swimlane: ProjectSwimlaneType;
  columns: TimelineColumn[];
  timelineWidth: number;
  onMilestoneClick: (milestone: MilestoneResponse) => void;
  onMilestoneDragEnd: (milestoneId: string, newDueDate: Date) => void;
}

const ProjectSwimlane: React.FC<ProjectSwimlaneProps> = ({
  swimlane,
  columns,
  timelineWidth,
  onMilestoneClick,
  onMilestoneDragEnd,
}) => {
  const sortedMilestones = [...swimlane.milestones].sort((a, b) => a.order - b.order);

  return (
    <div className="flex hover:bg-gray-50 transition-colors">
      {/* Project Info Column - Sticky */}
      <div className="sticky left-0 z-10 w-80 flex-shrink-0 px-6 py-6 border-r border-gray-200 bg-white shadow-[2px_0_8px_rgba(0,0,0,0.1)]">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 truncate mb-1">
                {swimlane.contractTitle}
              </h4>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{swimlane.milestones.length} milestones</span>
                <span>•</span>
                <span className="font-medium text-green-600">
                  ${swimlane.totalValue.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          
          {/* Progress Indicator */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium text-gray-900">
                {Math.round(swimlane.completionPercentage)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${swimlane.completionPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Column */}
      <div
        className="relative flex-shrink-0 py-6"
        style={{ width: `${timelineWidth}px`, minHeight: '100px' }}
      >
        {/* Background Grid */}
        <div className="absolute inset-0 flex">
          {columns.map((col, idx) => (
            <div
              key={idx}
              className={`w-20 border-r border-gray-100 ${col.isWeekend ? 'bg-gray-50' : ''} ${
                col.isToday ? 'bg-blue-50 border-blue-100' : ''
              }`}
            />
          ))}
        </div>

        {/* Milestone Bars */}
        <SortableContext
          items={sortedMilestones.map((m) => `milestone-${m.id}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="relative z-10 space-y-3 px-2">
            {sortedMilestones.map((milestone) => {
              const position = calculateMilestonePosition(
                milestone,
                {
                  start: columns[0].date,
                  end: columns[columns.length - 1].date,
                },
                timelineWidth
              );

              return (
                <MilestoneBar
                  key={milestone.id}
                  milestone={milestone}
                  position={position}
                  onClick={onMilestoneClick}
                  onDragEnd={onMilestoneDragEnd}
                />
              );
            })}
          </div>
        </SortableContext>
      </div>
    </div>
  );
};

export default ProjectSwimlane;
