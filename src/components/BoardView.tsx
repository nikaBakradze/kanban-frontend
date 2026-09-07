import React, { useRef, useState } from 'react';
import { useKanban } from '../context/KanbanContext';
import { ViewTaskModal } from './modals/ViewTaskModal';
import { updateTask } from '../api/kanbanApi';
import type { Task } from '../types/kanban';
import { motion } from 'framer-motion';
import { BoardSkeleton } from './Skeleton';

interface BoardViewProps {
  onOpenAddColumnModal: () => void;
  onOpenCreateBoardModal: () => void;
}

interface DragState {
  sourceColumnId: number;
  taskId: number;
}

interface DropTarget {
  columnId: number;
  taskId: number | null;
  after: boolean;
}

export const BoardView: React.FC<BoardViewProps> = ({ onOpenAddColumnModal, onOpenCreateBoardModal }) => {
  const { activeBoard, updateTaskInBoard, loading } = useKanban();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const [movingTaskId, setMovingTaskId] = useState<number | null>(null);
  const dragState = useRef<DragState | null>(null);
  const pointerStart = useRef<{ drag: DragState; x: number; y: number } | null>(null);
  const pointerDragging = useRef(false);
  const suppressClick = useRef(false);
  const pointerTarget = useRef<DropTarget | null>(null);

  const getColumnDotColor = (title: string, index: number) => {
    const cleanTitle = title.trim().toUpperCase();
    if (cleanTitle.includes('TODO')) return '#49C4E5';
    if (cleanTitle.includes('DOING')) return '#8471F2';
    if (cleanTitle.includes('DONE')) return '#67E2AE';
    
    const fallbackColors = ['#49C4E5', '#8471F2', '#67E2AE', '#E5A449', '#E549B8'];
    return fallbackColors[index % fallbackColors.length];
  };

  const hexToRgba = (hex: string, alpha: number) => {
    const value = hex.replace('#', '');
    const red = Number.parseInt(value.slice(0, 2), 16);
    const green = Number.parseInt(value.slice(2, 4), 16);
    const blue = Number.parseInt(value.slice(4, 6), 16);
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  };

  const getDropTargetAtPoint = (x: number, y: number): DropTarget | null => {
    const element = document.elementFromPoint(x, y);
    const columnElement = element?.closest<HTMLElement>('[data-column-id]');
    if (!columnElement) return null;

    const columnId = Number(columnElement.dataset.columnId);
    if (!Number.isInteger(columnId)) return null;

    const taskElement = element?.closest<HTMLElement>('[data-task-id]');
    if (!taskElement || !columnElement.contains(taskElement)) {
      const taskElements = Array.from(columnElement.querySelectorAll<HTMLElement>('[data-task-id]'));
      const firstTaskAfterPointer = taskElements.find((candidate) => {
        const rect = candidate.getBoundingClientRect();
        return y < rect.top + rect.height / 2;
      });
      if (firstTaskAfterPointer) {
        return { columnId, taskId: Number(firstTaskAfterPointer.dataset.taskId), after: false };
      }
      return { columnId, taskId: null, after: true };
    }

    const taskId = Number(taskElement.dataset.taskId);
    if (!Number.isInteger(taskId)) return { columnId, taskId: null, after: true };
    const rect = taskElement.getBoundingClientRect();
    return { columnId, taskId, after: y >= rect.top + rect.height / 2 };
  };

  const getDropTargetFromDragOver = (e: React.DragEvent): DropTarget | null => {
    const target = e.currentTarget as HTMLElement;
    const columnElement = target.closest<HTMLElement>('[data-column-id]');
    if (!columnElement) return getDropTargetAtPoint(e.clientX, e.clientY);

    const columnId = Number(columnElement.dataset.columnId);
    if (!Number.isInteger(columnId)) return null;

    const taskId = Number(target.dataset.taskId);
    if (target.dataset.taskId && Number.isInteger(taskId)) {
      const rect = target.getBoundingClientRect();
      return { columnId, taskId, after: e.clientY >= rect.top + rect.height / 2 };
    }

    const taskElements = Array.from(columnElement.querySelectorAll<HTMLElement>('[data-task-id]'));
    const firstTaskAfterPointer = taskElements.find((candidate) => {
      const rect = candidate.getBoundingClientRect();
      return e.clientY < rect.top + rect.height / 2;
    });

    return firstTaskAfterPointer
      ? { columnId, taskId: Number(firstTaskAfterPointer.dataset.taskId), after: false }
      : { columnId, taskId: null, after: true };
  };

  const getDropPosition = (drag: DragState, target: DropTarget): number | null => {
    if (!activeBoard) return null;
    const targetColumn = activeBoard.columns.find((column) => column.id === target.columnId);
    if (!targetColumn) return null;

    const remaining = targetColumn.tasks.filter((task) => task.id !== drag.taskId);
    if (target.taskId === null) return remaining.length;
    if (target.taskId === drag.taskId) {
      return targetColumn.tasks.findIndex((task) => task.id === drag.taskId);
    }

    const targetIndex = remaining.findIndex((task) => task.id === target.taskId);
    if (targetIndex < 0) return remaining.length;
    return targetIndex + (target.after ? 1 : 0);
  };

  const moveTask = async (drag: DragState, target: DropTarget) => {
    if (!activeBoard || movingTaskId !== null) return;
    const sourceColumn = activeBoard.columns.find((column) => column.id === drag.sourceColumnId);
    const movedTask = sourceColumn?.tasks.find((task) => task.id === drag.taskId);
    const targetPosition = getDropPosition(drag, target);
    if (!movedTask || targetPosition === null) return;
    if (movedTask.column_id === target.columnId && movedTask.position === targetPosition) return;

    try {
      setMovingTaskId(movedTask.id);
      const updatedTask = await updateTask(movedTask.id, {
        column_id: target.columnId,
        position: targetPosition,
      });
      updateTaskInBoard(updatedTask);
    } catch (error) {
      console.error('Failed to move task:', error);
      alert('Failed to move task.');
    } finally {
      setMovingTaskId(null);
    }
  };

  const handleDragStart = (e: React.DragEvent, sourceColumnId: number, taskId: number) => {
    const drag = { sourceColumnId, taskId };
    dragState.current = drag;
    setDraggedTaskId(taskId);
    setDropTarget(null);
    e.dataTransfer.setData('sourceColumnId', sourceColumnId.toString());
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('taskId', taskId.toString());
  };

  const handleDragEnd = () => {
    dragState.current = null;
    setDraggedTaskId(null);
    setDropTarget(null);
  };

  const handlePointerDown = (e: React.PointerEvent, sourceColumnId: number, taskId: number) => {
    if (e.pointerType !== 'touch') return;
    const drag = { sourceColumnId, taskId };
    pointerStart.current = { drag, x: e.clientX, y: e.clientY };
    dragState.current = drag;
    pointerDragging.current = false;
    pointerTarget.current = null;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'touch') return;
    const start = pointerStart.current;
    if (!start) return;
    if (Math.hypot(e.clientX - start.x, e.clientY - start.y) < 8) return;
    pointerDragging.current = true;
    suppressClick.current = true;
    setDraggedTaskId(start.drag.taskId);
    pointerTarget.current = getDropTargetAtPoint(e.clientX, e.clientY);
    setDropTarget(pointerTarget.current);
  };

  const finishPointerDrag = (e: React.PointerEvent) => {
    if (e.pointerType !== 'touch') return;
    const start = pointerStart.current;
    const wasDragging = pointerDragging.current;
    const target = getDropTargetAtPoint(e.clientX, e.clientY) || pointerTarget.current;
    pointerStart.current = null;
    pointerDragging.current = false;
    pointerTarget.current = null;
    dragState.current = null;
    setDraggedTaskId(null);
    setDropTarget(null);
    if (!start || !activeBoard) return;
    if (!wasDragging) {
      const task = activeBoard.columns
        .find((column) => column.id === start.drag.sourceColumnId)
        ?.tasks.find((taskItem) => taskItem.id === start.drag.taskId);
      if (task) setSelectedTask(task);
      return;
    }
    e.preventDefault();
    if (target) void moveTask(start.drag, target);
  };

  const handlePointerCancel = () => {
    pointerStart.current = null;
    pointerDragging.current = false;
    pointerTarget.current = null;
    dragState.current = null;
    setDraggedTaskId(null);
    setDropTarget(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget(getDropTargetFromDragOver(e));
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget(getDropTargetFromDragOver(e));
  };

  const handleTaskDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget(getDropTargetFromDragOver(e));
  };

  const handleTaskDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget(getDropTargetFromDragOver(e));
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const currentTarget = e.currentTarget as HTMLElement;
    const relatedTarget = e.relatedTarget as Node | null;
    if (relatedTarget && currentTarget.contains(relatedTarget)) return;

    const { clientX, clientY } = e;
    window.requestAnimationFrame(() => {
      setDropTarget(getDropTargetAtPoint(clientX, clientY));
    });
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: number, targetTaskId: number | null = null) => {
    e.preventDefault();
    const state = dragState.current;
    const sourceColumnId = Number(e.dataTransfer.getData('sourceColumnId'));
    const taskId = Number(e.dataTransfer.getData('taskId'));
    const drag = state || (
      Number.isInteger(sourceColumnId) && Number.isInteger(taskId)
        ? { sourceColumnId, taskId }
        : null
    );
    if (!drag) return;
    const pointTarget = targetTaskId === null ? getDropTargetAtPoint(e.clientX, e.clientY) : null;
    const location = targetTaskId === null
      ? (pointTarget?.columnId === targetColumnId
        ? pointTarget
        : { columnId: targetColumnId, taskId: null, after: true })
      : (() => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        return { columnId: targetColumnId, taskId: targetTaskId, after: e.clientY >= rect.top + rect.height / 2 };
      })();
    void moveTask(drag, location);
    dragState.current = null;
    setDraggedTaskId(null);
    setDropTarget(null);
  };

  if (loading) {
    return <BoardSkeleton />;
  }

  if (!activeBoard) {
    return (
      <main className="flex-1 flex items-center justify-center p-6 bg-[#F4F7FD] dark:bg-[#20212C] w-full h-full">
        <div className="flex flex-col items-center justify-center gap-6 text-center max-w-md">
          <p className="text-[#828FA3] font-bold text-lg leading-relaxed">
            There are no boards available. Create a new board to get started.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenCreateBoardModal}
            className="bg-[#635FC7] hover:bg-[#A8A4FF] text-white font-bold text-[15px] px-8 py-4 rounded-full cursor-pointer transition-colors shadow-md"
          >
            + Add New Board
          </motion.button>
        </div>
      </main>
    );
  }

  if (!activeBoard.columns || activeBoard.columns.length === 0) {
    return (
      <main className="flex-1 flex items-center justify-center p-6 bg-[#F4F7FD] dark:bg-[#20212C] w-full h-full">
        <div className="flex flex-col items-center justify-center gap-6 text-center max-w-md">
          <p className="text-[#828FA3] font-bold text-lg leading-relaxed">
            This board is empty. Create a new column to get started.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenAddColumnModal}
            className="bg-[#635FC7] hover:bg-[#A8A4FF] text-white font-bold text-[15px] px-8 py-4 rounded-full cursor-pointer transition-colors shadow-md"
          >
            + Add New Column
          </motion.button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-x-auto p-6 flex gap-6 bg-[#F4F7FD] dark:bg-[#20212C] h-full items-start">
      {activeBoard.columns.map((col, index) => {
        const columnColor = getColumnDotColor(col.title, index);
        const isDropTarget = dropTarget?.columnId === col.id && draggedTaskId !== null;
        const columnTint = hexToRgba(columnColor, 0.07);
        const columnGlow = hexToRgba(columnColor, 0.24);
        const indicatorColor = hexToRgba(columnColor, 0.78);

        return (
          <div
            key={col.id}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
            data-column-id={col.id}
            data-drop-target={draggedTaskId !== null ? 'true' : undefined}
            className={`w-70 shrink-0 min-h-[calc(100vh-3rem)] flex flex-col gap-6 transition-[background-color,box-shadow,outline] duration-200 ${
              isDropTarget ? 'rounded-lg' : ''
            }`}
            style={isDropTarget ? {
              backgroundColor: columnTint,
              outline: `1px solid ${hexToRgba(columnColor, 0.42)}`,
              boxShadow: `0 0 22px ${columnGlow}`,
            } : undefined}
          >
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: columnColor }} />
            <h3 className="text-xs font-bold text-[#828FA3] uppercase tracking-[2.4px]">
              {col.title} ({col.tasks?.length || 0})
            </h3>
          </div>

          <div className="flex min-h-100 flex-1 flex-col gap-5 pb-6">
            {col.tasks?.map((task) => {
              const completedCount = task.subtasks?.filter(
                (st) => st.is_completed
              ).length || 0;
              const totalSubtasks = task.subtasks?.length || 0;
              const showInsertionBefore = dropTarget?.columnId === col.id
                && dropTarget.taskId === task.id
                && !dropTarget.after
                && draggedTaskId !== null;
              const showInsertionAfter = dropTarget?.columnId === col.id
                && dropTarget.taskId === task.id
                && dropTarget.after
                && draggedTaskId !== null;

              return (
                <React.Fragment key={task.id}>
                  {showInsertionBefore && (
                    <div
                      className="h-1 rounded-full transition-all duration-200"
                      style={{ backgroundColor: indicatorColor, boxShadow: `0 0 10px ${columnGlow}` }}
                    />
                  )}
                  <motion.div
                    layout
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    whileDrag={{ scale: 1.02, opacity: 0.75 }}
                    transition={{
                      layout: { type: 'tween', duration: 0.18, ease: 'easeOut' },
                      scale: { type: 'spring', stiffness: 420, damping: 26 },
                      opacity: { duration: 0.15, ease: 'easeOut' },
                    }}
                    draggable
                    data-task-id={task.id}
                    onDragStart={(e) => handleDragStart(e, col.id, task.id)}
                    onDragEnd={handleDragEnd}
                    onDragEnter={handleTaskDragEnter}
                    onDragOver={handleTaskDragOver}
                    onDrop={(e) => {
                      e.stopPropagation();
                      handleDrop(e, col.id, task.id);
                    }}
                    onPointerDown={(e) => handlePointerDown(e, col.id, task.id)}
                    onPointerMove={handlePointerMove}
                    onPointerUp={finishPointerDrag}
                    onPointerCancel={handlePointerCancel}
                    onClick={(e) => {
                      if (suppressClick.current) {
                        e.preventDefault();
                        suppressClick.current = false;
                        return;
                      }
                      setSelectedTask(task);
                    }}
                    style={{ touchAction: 'none', opacity: draggedTaskId === task.id ? 0.5 : 1 }}
                    className={`bg-white dark:bg-[#2B2C37] px-4 py-6 rounded-lg hover:text-[#635FC7] cursor-pointer transition-colors transition-shadow duration-200 group ${
                      draggedTaskId === task.id
                        ? 'relative z-10 shadow-xl ring-2 ring-[#635FC7]/30'
                        : 'shadow-sm'
                    }`}
                  >
                    <h4 className="font-bold text-[#000112] dark:text-white text-[15px] group-hover:text-[#635FC7] mb-2">
                      {task.title}
                    </h4>
                    <p className="text-xs font-bold text-[#828FA3]">
                      {completedCount} of {totalSubtasks} subtasks
                    </p>
                  </motion.div>
                  {showInsertionAfter && (
                    <div
                      className="h-1 rounded-full transition-all duration-200"
                      style={{ backgroundColor: indicatorColor, boxShadow: `0 0 10px ${columnGlow}` }}
                    />
                  )}
                </React.Fragment>
              );
            })}
            {dropTarget?.columnId === col.id
              && dropTarget.taskId === null
              && draggedTaskId !== null
              && (
                <div
                  className="h-1 rounded-full transition-all duration-200"
                  style={{ backgroundColor: indicatorColor, boxShadow: `0 0 10px ${columnGlow}` }}
                />
              )}
            {dropTarget?.columnId === col.id
              && col.tasks.length === 0
              && draggedTaskId !== null
              && (
                <div
                  className="flex min-h-24 items-center justify-center rounded-lg border-2 border-dashed text-xs font-bold"
                  style={{
                    borderColor: hexToRgba(columnColor, 0.42),
                    color: columnColor,
                    backgroundColor: hexToRgba(columnColor, 0.06),
                  }}
                >
                  Drop here
                </div>
              )}
          </div>
          </div>
        );
      })}
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={onOpenAddColumnModal}
        className="w-70 shrink-0 self-stretch mt-8 bg-linear-to-b from-[#E9EFFA] to-[#E9EFFA]/50 dark:from-[#22232E] dark:to-[#22232E]/50 rounded-md flex items-center justify-center cursor-pointer group transition-colors min-h-100"
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenAddColumnModal();
          }}
          className="text-[#828FA3] group-hover:text-[#635FC7] font-bold text-2xl transition-colors cursor-pointer"
        >
          + New Column
        </button>
      </motion.div>

      <ViewTaskModal task={selectedTask} onClose={() => setSelectedTask(null)} />
    </main>
  );
};
