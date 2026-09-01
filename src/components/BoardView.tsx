import React, { useState } from 'react';
import { useKanban } from '../context/KanbanContext';
import { ViewTaskModal } from './modals/ViewTaskModal';
import { updateTask } from '../api/kanbanApi';
import type { Task } from '../types/kanban';
import { motion } from 'framer-motion';

interface BoardViewProps {
  onOpenAddColumnModal: () => void;
  onOpenCreateBoardModal: () => void;
}

export const BoardView: React.FC<BoardViewProps> = ({ onOpenAddColumnModal, onOpenCreateBoardModal }) => {
  const { activeBoard, updateTaskInBoard, loading } = useKanban();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const getColumnDotColor = (title: string, index: number) => {
    const cleanTitle = title.trim().toUpperCase();
    if (cleanTitle.includes('TODO')) return '#49C4E5';
    if (cleanTitle.includes('DOING')) return '#8471F2';
    if (cleanTitle.includes('DONE')) return '#67E2AE';
    
    const fallbackColors = ['#49C4E5', '#8471F2', '#67E2AE', '#E5A449', '#E549B8'];
    return fallbackColors[index % fallbackColors.length];
  };

  const handleDragStart = (e: React.DragEvent, taskId: number) => {
    e.dataTransfer.setData('taskId', taskId.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetColumnId: number) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId || !activeBoard) return;

    try {
      const sourceColumn = activeBoard.columns.find((column) =>
        column.tasks.some((task) => task.id === Number(taskId)));
      const targetColumn = activeBoard.columns.find((column) => column.id === targetColumnId);
      if (!sourceColumn || !targetColumn) return;
      const movedTask = sourceColumn.tasks.find((task) => task.id === Number(taskId));
      if (!movedTask) return;
      const targetPosition = movedTask.column_id === targetColumnId
        ? Math.max(0, targetColumn.tasks.length - 1)
        : targetColumn.tasks.length;
      const updatedTask = await updateTask(movedTask.id, {
        column_id: targetColumnId,
        position: targetPosition,
      });
      updateTaskInBoard(updatedTask);
    } catch (error: unknown) {
      console.error('Failed to move task:', error);
      alert('Failed to move task.');
    }
  };

  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-[#828FA3] font-bold">Loading board data...</div>;
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
      {activeBoard.columns.map((col, index) => (
        <div
          key={col.id}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, col.id)}
          className="w-70 shrink-0 flex flex-col gap-6"
        >
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getColumnDotColor(col.title, index) }} />
            <h3 className="text-xs font-bold text-[#828FA3] uppercase tracking-[2.4px]">
              {col.title} ({col.tasks?.length || 0})
            </h3>
          </div>

          <div className="flex flex-col gap-5">
            {col.tasks?.map((task) => {
              const completedCount = task.subtasks?.filter(
                (st) => st.is_completed
              ).length || 0;
              const totalSubtasks = task.subtasks?.length || 0;

              return (
                <motion.div
                  key={task.id}
                  layout
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onClick={() => setSelectedTask(task)}
                  className="bg-white dark:bg-[#2B2C37] px-4 py-6 rounded-lg shadow-sm hover:text-[#635FC7] cursor-pointer transition-colors group"
                >
                  <h4 className="font-bold text-[#000112] dark:text-white text-[15px] group-hover:text-[#635FC7] mb-2">
                    {task.title}
                  </h4>
                  <p className="text-xs font-bold text-[#828FA3]">
                    {completedCount} of {totalSubtasks} subtasks
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
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
