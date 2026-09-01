/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { deleteTask, toggleSubtask, updateTask } from '../../api/kanbanApi';
import { useKanban } from '../../context/KanbanContext';
import type { Task, Subtask } from '../../types/kanban';
import { EditTaskModal } from './EditTaskModal';
import { motion, AnimatePresence } from 'framer-motion';

interface ViewTaskModalProps {
  task: Task | null;
  onClose: () => void;
}

export const ViewTaskModal: React.FC<ViewTaskModalProps> = ({ task, onClose }) => {
  const { activeBoard, updateTaskInBoard, updateSubtaskInBoard, removeTaskFromBoard } = useKanban();
  const [showOptions, setShowOptions] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [selectedColumnId, setSelectedColumnId] = useState<number | string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setSubtasks(task.subtasks || []);
      setSelectedColumnId(task.column_id);
    }
  }, [task]);

  if (!task || !activeBoard) return null;

  const taskId = task.id;
  const completedSubtasksCount = subtasks.filter((st) => Boolean(st.is_completed)).length;
  const totalSubtasksCount = subtasks.length;

  const handleToggleSubtask = async (index: number) => {
    const current = subtasks[index];
    if (!current?.id) return;
    const nextValue = !current.is_completed;
    setSubtasks((prev) => prev.map((st, i) => i === index ? { ...st, is_completed: nextValue } : st));
    try {
      const updatedSubtask = await toggleSubtask(current.id, nextValue);
      const normalizedSubtask: Subtask = {
        ...current,
        ...updatedSubtask,
        is_completed: Boolean(updatedSubtask.is_completed),
      };
      setSubtasks((prev) => prev.map((st, i) => i === index ? normalizedSubtask : st));
      updateSubtaskInBoard(normalizedSubtask);
    } catch (error: unknown) {
      setSubtasks((prev) => prev.map((st, i) => i === index ? { ...st, is_completed: current.is_completed } : st));
      alert(axios.isAxiosError(error) ? error.response?.data?.message || 'Failed to update subtask.' : 'Failed to update subtask.');
    }
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      const parsedColId = Number(selectedColumnId);

      const formattedSubtasks = subtasks.map((st) => ({
        id: st.id,
        title: st.title,
        is_completed: st.is_completed,
      }));

      const updatedTask = await updateTask(taskId, {
        title: task.title,
        description: task.description || null,
        column_id: parsedColId,
        position: task.position,
        subtasks: formattedSubtasks,
      });
      updateTaskInBoard(updatedTask);
      onClose();
    } catch (error: unknown) {
      const message = axios.isAxiosError(error) ? error.response?.data?.message : undefined;
      console.error('Save error details:', error);
      alert(message || 'Failed to save task.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteTask(taskId);
      removeTaskFromBoard(taskId);
      setIsDeleteModalOpen(false);
      onClose();
    } catch (error: unknown) {
      const message = axios.isAxiosError(error) ? error.response?.data?.message : undefined;
      console.error('Delete error:', error);
      alert(message || 'Failed to delete task.');
    }
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 cursor-pointer"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#2B2C37] w-full max-w-120 rounded-lg p-6 md:p-8 space-y-6 cursor-default relative shadow-xl max-h-[85vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-[#000112] dark:text-white leading-snug">
                {task.title}
              </h2>

              <div className="relative shrink-0">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setShowOptions(!showOptions)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-[#20212C] rounded-full transition-colors cursor-pointer"
                >
                  <svg width="5" height="20" viewBox="0 0 5 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="2.30769" cy="2.30769" r="2.30769" fill="#828FA3"/>
                    <circle cx="2.30769" cy="10" r="2.30769" fill="#828FA3"/>
                    <circle cx="2.30769" cy="17.6923" r="2.30769" fill="#828FA3"/>
                  </svg>
                </motion.button>

                <AnimatePresence>
                  {showOptions && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute right-0 top-10 w-48 bg-white dark:bg-[#20212C] shadow-lg rounded-xl p-4 space-y-4 z-10 border border-gray-100 dark:border-gray-800"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setShowOptions(false);
                          setIsEditOpen(true);
                        }}
                        className="w-full text-left text-sm font-semibold text-[#828FA3] hover:text-[#635FC7] transition-colors cursor-pointer"
                      >
                        Edit Task
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowOptions(false);
                          setIsDeleteModalOpen(true);
                        }}
                        className="w-full text-left text-sm font-semibold text-[#EA5555] hover:opacity-80 transition-opacity cursor-pointer"
                      >
                        Delete Task
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-[#828FA3] leading-relaxed">
              {task.description || 'No description provided.'}
            </p>

            {/* Subtasks Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-[#828FA3] dark:text-white tracking-wider">
                Subtasks ({completedSubtasksCount} of {totalSubtasksCount})
              </h3>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {subtasks.map((st, index) => {
                  const isChecked = Boolean(st.is_completed);

                  return (
                    <motion.div
                      key={st.id || st._id || index}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleToggleSubtask(index)}
                      className="flex items-center gap-4 p-3 bg-[#F4F7FD] dark:bg-[#20212C] hover:bg-[#635FC7]/25 dark:hover:bg-[#635FC7]/25 rounded-md cursor-pointer transition-colors"
                    >
                      <div
                        className={`w-4 h-4 rounded-sm flex items-center justify-center shrink-0 border transition-all ${
                          isChecked
                            ? 'bg-[#635FC7] border-[#635FC7]'
                            : 'bg-white dark:bg-[#2B2C37] border-[#828FA3]/25'
                        }`}
                      >
                        {isChecked ? (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1.27588 3.066L3.92254 5.71266L8.72254 0.91266" stroke="white" strokeWidth="2"/>
                          </svg>
                        ) : null}
                      </div>

                      <span
                        className={`text-xs font-bold transition-all select-none ${
                          isChecked
                            ? 'line-through text-[#828FA3]'
                            : 'text-[#000112] dark:text-white'
                        }`}
                      >
                        {st.title}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Current Status */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#828FA3] dark:text-white">
                Current Status
              </label>
              <select
                value={selectedColumnId}
                onChange={(e) => setSelectedColumnId(e.target.value)}
                className="w-full px-4 py-3 text-sm font-semibold border border-[#828FA3]/25 rounded-md bg-transparent text-[#000112] dark:text-white focus:outline-none focus:border-[#635FC7] cursor-pointer"
              >
                {activeBoard.columns?.map((col) => (
                  <option
                    key={col.id}
                    value={col.id}
                    className="bg-white dark:bg-[#2B2C37] text-[#000112] dark:text-white"
                  >
                    {col.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Save Changes Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="w-full py-3 bg-[#635FC7] hover:bg-[#A8A4FF] text-white font-bold text-sm rounded-full transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </motion.button>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Edit Task Modal */}
      <EditTaskModal
        task={task}
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          onClose();
        }}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsDeleteModalOpen(false)}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#2B2C37] w-full max-w-120 rounded-lg p-6 md:p-8 space-y-6 cursor-default relative shadow-xl"
            >
              <h3 className="text-lg font-bold text-[#EA5555]">Delete this task?</h3>
              <p className="text-sm text-[#828FA3] leading-relaxed">
                Are you sure you want to delete the '{task.title}' task and its subtasks? This action cannot be reversed.
              </p>
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 py-3 text-sm font-bold text-white bg-[#EA5555] hover:bg-[#FF9898] rounded-full transition-colors cursor-pointer"
                >
                  Delete
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-3 text-sm font-bold text-[#635FC7] bg-[#635FC7]/10 dark:bg-white rounded-full hover:bg-[#635FC7]/20 transition-colors cursor-pointer"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};