'use client';

import React from 'react';
import { TimelineColumn, TimelineZoom, getDayName, isToday } from '@/lib/utils/timelineUtils';

interface TimelineHeaderProps {
  columns: TimelineColumn[];
  zoom: TimelineZoom;
  onZoomChange: (zoom: TimelineZoom) => void;
}

const TimelineHeader: React.FC<TimelineHeaderProps> = ({ columns, zoom, onZoomChange }) => {
  const zoomLevels: TimelineZoom[] = ['week', 'month', 'quarter'];

  return (
    <div className="bg-gray-50">
      {/* Zoom Controls */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">View:</span>
          <div className="inline-flex rounded-md shadow-sm">
            {zoomLevels.map((level) => (
              <button
                key={level}
                onClick={() => onZoomChange(level)}
                className={`
                  px-3 py-1.5 text-xs font-medium transition-colors
                  ${level === 'week' ? 'rounded-l-md' : ''}
                  ${level === 'quarter' ? 'rounded-r-md' : ''}
                  ${level !== 'quarter' ? 'border-r' : ''}
                  ${
                    zoom === level
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="text-xs text-gray-500">
          {columns.length} days
        </div>
      </div>

      {/* Date Columns */}
      <div className="flex">
        {columns.map((column, index) => {
          const date = column.date;
          const dayName = getDayName(date);
          const isCurrentDay = isToday(date);
          
          return (
            <div
              key={index}
              className={`
                flex-shrink-0 w-20 border-r border-gray-200 text-center py-3
                ${isCurrentDay ? 'bg-blue-50 border-blue-200' : ''}
                ${column.isWeekend ? 'bg-gray-100' : ''}
              `}
            >
              <div className={`text-xs font-medium mb-1 ${isCurrentDay ? 'text-blue-600' : 'text-gray-500'}`}>
                {dayName}
              </div>
              <div className={`text-sm font-semibold ${isCurrentDay ? 'text-blue-700' : 'text-gray-900'}`}>
                {date.getDate()}
              </div>
              {isCurrentDay && (
                <div className="inline-block mt-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full font-medium">
                  Today
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineHeader;
