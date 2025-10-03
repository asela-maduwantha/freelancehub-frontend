'use client';

import React from 'react';
import { MilestoneResponse } from '@/lib/api/milestones';
import { ContractResponse } from '@/lib/api/contracts';
import {
  TimelineZoom,
  TimelineColumn,
  ProjectSwimlane as ProjectSwimlaneType,
} from '@/lib/utils/timelineUtils';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import TimelineHeader from './TimelineHeader';
import ProjectSwimlane from './ProjectSwimlane';

interface TimelineViewProps {
  swimlanes: ProjectSwimlaneType[];
  columns: TimelineColumn[];
  zoom: TimelineZoom;
  onZoomChange: (zoom: TimelineZoom) => void;
  onMilestoneClick: (milestone: MilestoneResponse) => void;
  onMilestoneDragEnd: (milestoneId: string, newDueDate: Date) => void;
}

const TimelineView: React.FC<TimelineViewProps> = ({
  swimlanes,
  columns,
  zoom,
  onZoomChange,
  onMilestoneClick,
  onMilestoneDragEnd,
}) => {
  const timelineWidth = columns.length * 80; // Increased to 80px per day for better spacing

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const activeData = active.data.current;

    if (activeData?.type === 'milestone' && delta.x !== 0) {
      const daysDragged = Math.round(delta.x / 80); // Updated to match new column width
      const milestone = activeData.milestone as MilestoneResponse;
      const newDueDate = new Date(milestone.dueDate);
      newDueDate.setDate(newDueDate.getDate() + daysDragged);
      onMilestoneDragEnd(milestone.id, newDueDate);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Timeline Container - relative positioning for sticky to work */}
        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)', position: 'relative' }}>
          <div className="min-w-full inline-block">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white border-b-2 border-gray-200">
              <div className="flex">
                {/* Project Column Header - Sticky */}
                <div className="sticky left-0 z-30 w-80 flex-shrink-0 px-6 py-4 bg-gray-50 border-r border-gray-200 shadow-[2px_0_8px_rgba(0,0,0,0.1)]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Projects & Milestones
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{swimlanes.length} Projects</span>
                    </div>
                  </div>
                </div>
                {/* Timeline Header */}
                <div style={{ width: `${timelineWidth}px` }} className="flex-shrink-0">
                  <TimelineHeader
                    columns={columns}
                    zoom={zoom}
                    onZoomChange={onZoomChange}
                  />
                </div>
              </div>
            </div>

            {/* Swimlanes */}
            <div className="divide-y divide-gray-100">
              {swimlanes.length === 0 ? (
                <div className="flex items-center justify-center py-20 text-gray-400">
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-sm">No milestones to display</p>
                  </div>
                </div>
              ) : (
                swimlanes.map((swimlane, index) => (
                  <ProjectSwimlane
                    key={`swimlane-${swimlane.contractId}-${index}`}
                    swimlane={swimlane}
                    columns={columns}
                    timelineWidth={timelineWidth}
                    onMilestoneClick={onMilestoneClick}
                    onMilestoneDragEnd={onMilestoneDragEnd}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DndContext>
  );
};

export default TimelineView;
