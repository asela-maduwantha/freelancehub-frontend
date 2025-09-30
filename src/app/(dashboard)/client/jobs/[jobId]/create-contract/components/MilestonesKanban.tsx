import React from 'react';
import { Card, CardHeader, CardBody } from '../../../../../../../components/ui/Card';
import Button from '../../../../../../../components/ui/Button';
import { ProposalResponse } from '../../../../../../../lib/api/proposals';
import { MilestoneFormData } from '../types';
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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import {
  useDroppable,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface MilestonesKanbanProps {
  milestones: MilestoneFormData[];
  proposal: ProposalResponse | null;
  isSubmitting: boolean;
  isAddMilestoneModalOpen: boolean;
  setIsAddMilestoneModalOpen: (open: boolean) => void;
  sensors: any;
  handleDragEnd: (event: DragEndEvent) => void;
  handleMilestoneChange: (index: number, field: keyof MilestoneFormData, value: any) => void;
  handleRemoveMilestone: (index: number) => void;
  formatCurrency: (amount: number, currency?: string) => string;
  getTotalMilestoneAmount: () => number;
}

// Import the components that are defined in the main file
// These will need to be moved to separate files later
function DroppableColumn({ id, title, color, count, children }: any) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div className="flex-shrink-0 w-80">
      <div
        ref={setNodeRef}
        className={`bg-secondary rounded-lg p-4 h-96 transition-all duration-200 overflow-y-auto ${
          isOver ? 'ring-2 ring-primary ring-opacity-50 bg-primary bg-opacity-5' : ''
        }`}
      >
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-light">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${color}`}></div>
            <h4 className="font-medium text-primary">{title}</h4>
            <span className="text-xs text-secondary bg-light px-2 py-1 rounded-full">
              {count}
            </span>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function SortableMilestoneCard({ milestone, index, onChange, onRemove, isSubmitting, formatCurrency }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: milestone.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`card-default p-3 cursor-move w-64 flex-shrink-0 ${
        isDragging ? 'opacity-50 shadow-lg scale-105 rotate-2' : ''
      } ${!milestone.isSelected && milestone.column === 'contract' ? 'opacity-60' : ''}`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="text-xs font-medium text-primary">
            #{index}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="text-xs font-semibold" style={{color: 'var(--color-success)'}}>
            {formatCurrency(milestone.amount)}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e?: React.MouseEvent<HTMLButtonElement>) => {
              e?.stopPropagation();
              onRemove(index);
            }}
            disabled={isSubmitting}
            className="text-error hover:text-error hover:bg-error-light p-0.5"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          {milestone.column === 'contract' ? (
            <input
              type="text"
              value={milestone.title}
              onChange={(e) => onChange(index, 'title', e.target.value)}
              className="input-default text-xs w-full"
              placeholder="Milestone title"
              disabled={isSubmitting}
            />
          ) : (
            <div className="text-xs font-medium text-primary line-clamp-2">
              {milestone.title || 'Untitled Milestone'}
            </div>
          )}
        </div>

        <div>
          {milestone.column === 'contract' ? (
            <textarea
              value={milestone.description}
              onChange={(e) => onChange(index, 'description', e.target.value)}
              className="input-default text-xs w-full resize-none"
              rows={2}
              placeholder="Milestone description"
              disabled={isSubmitting}
            />
          ) : (
            <div className="text-xs text-secondary line-clamp-3">
              {milestone.description || 'No description provided'}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          {milestone.column === 'contract' ? (
            <div className="flex items-center gap-2 w-full">
              <div className="flex-1">
                <input
                  type="number"
                  value={milestone.amount}
                  onChange={(e) => onChange(index, 'amount', parseFloat(e.target.value) || 0)}
                  className="input-default text-xs w-full"
                  placeholder="Amount"
                  min="0"
                  step="0.01"
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  value={milestone.durationDays}
                  onChange={(e) => onChange(index, 'durationDays', parseInt(e.target.value) || 1)}
                  className="input-default text-xs w-full"
                  placeholder="Days"
                  min="1"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <svg className="h-3 w-3 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs text-secondary">{milestone.durationDays} days</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-light">
          <div className="flex items-center gap-1">
            <span className={`text-xs px-2 py-1 rounded-full ${
              milestone.column === 'contract'
                ? 'bg-success-light text-success'
                : 'bg-secondary text-secondary'
            }`}>
              {milestone.column === 'contract' ? 'In Contract' : 'Available'}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs text-secondary">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            <span>Drag</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MilestonesKanban({
  milestones,
  proposal,
  isSubmitting,
  isAddMilestoneModalOpen,
  setIsAddMilestoneModalOpen,
  sensors,
  handleDragEnd,
  handleMilestoneChange,
  handleRemoveMilestone,
  formatCurrency,
  getTotalMilestoneAmount
}: MilestonesKanbanProps) {
  return (
    <Card variant="default">
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-primary">Project Milestones</h3>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setIsAddMilestoneModalOpen(true)}
            disabled={isSubmitting}
          >
            + Add Milestone
          </Button>
        </div>
        <p className="text-secondary text-sm mt-1">
          Drag milestones between columns to organize them. Only milestones in "Contract Milestones" will be included.
        </p>
      </CardHeader>
      <CardBody>
        {milestones.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-muted mb-4">
              <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-secondary mb-4">No milestones defined yet.</p>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setIsAddMilestoneModalOpen(true)}
              disabled={isSubmitting}
            >
              Add First Milestone
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={milestones.map(m => m.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex gap-6 overflow-x-auto pb-4">
                  {/* Proposal Column */}
                  <DroppableColumn
                    id="proposal-column"
                    title="Proposal Milestones"
                    color="bg-blue-500"
                    count={milestones.filter(m => m.column === 'proposal').length}
                  >
                    <div className="space-y-3">
                      {milestones
                        .filter(m => m.column === 'proposal')
                        .map((milestone, index) => (
                          <SortableMilestoneCard
                            key={milestone.id}
                            milestone={milestone}
                            index={milestones.findIndex(m => m.id === milestone.id)}
                            onChange={handleMilestoneChange}
                            onRemove={handleRemoveMilestone}
                            isSubmitting={isSubmitting}
                            formatCurrency={formatCurrency}
                          />
                        ))}
                    </div>
                  </DroppableColumn>

                  {/* Custom Column */}
                  <DroppableColumn
                    id="custom-column"
                    title="Custom Milestones"
                    color="bg-orange-500"
                    count={milestones.filter(m => m.column === 'custom').length}
                  >
                    <div className="space-y-3">
                      {milestones
                        .filter(m => m.column === 'custom')
                        .map((milestone, index) => (
                          <SortableMilestoneCard
                            key={milestone.id}
                            milestone={milestone}
                            index={milestones.findIndex(m => m.id === milestone.id)}
                            onChange={handleMilestoneChange}
                            onRemove={handleRemoveMilestone}
                            isSubmitting={isSubmitting}
                            formatCurrency={formatCurrency}
                          />
                        ))}
                    </div>
                  </DroppableColumn>

                  {/* Contract Column */}
                  <DroppableColumn
                    id="contract-column"
                    title="Contract Milestones"
                    color="bg-green-500"
                    count={milestones.filter(m => m.column === 'contract').length}
                  >
                    <div className="space-y-3">
                      {milestones
                        .filter(m => m.column === 'contract')
                        .map((milestone, contractIndex) => (
                          <SortableMilestoneCard
                            key={milestone.id}
                            milestone={milestone}
                            index={contractIndex + 1}
                            onChange={handleMilestoneChange}
                            onRemove={handleRemoveMilestone}
                            isSubmitting={isSubmitting}
                            formatCurrency={formatCurrency}
                          />
                        ))}
                    </div>
                  </DroppableColumn>
                </div>
              </SortableContext>
            </DndContext>

            {/* Total Summary */}
            {milestones.filter(m => m.isSelected).length > 0 && (
              <div className="bg-secondary rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-primary">
                    Total Contract Amount ({milestones.filter(m => m.column === 'contract').length} milestones)
                  </span>
                  <span className="text-lg font-semibold" style={{color: 'var(--color-success)'}}>
                    {formatCurrency(getTotalMilestoneAmount())}
                  </span>
                </div>
                {proposal && (
                  <div className="text-sm text-secondary mt-1">
                    Proposal total: {formatCurrency(proposal.proposedRate.amount)}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}