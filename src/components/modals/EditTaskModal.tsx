/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { updateTask } from '../../api/kanbanApi';
import { useKanban } from '../../context/KanbanContext';
import type { Task, Subtask } from '../../types/kanban';
import { motion, AnimatePresence } from 'framer-motion';

interface EditTaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({ task, isOpen, onClose }) => {
  const { activeBoard, updateTaskInBoard } = useKanban();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [columnId, setColumnId] = useState<number | string>('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setColumnId(task.column_id);
      setSubtasks(task.subtasks || []);
    }
  }, [task]);

  if (!isOpen || !task || !activeBoard) return null;

  const handleSubtaskChange = (index: number, value: string) => {
    const updated = [...subtasks];
    updated[index].title = value;
    setSubtasks(updated);
  };

  const handleAddSubtask = () => {
    setSubtasks([...subtasks, { id: 0, task_id: task?.id ?? 0, title: '', is_completed: false }]);
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskId = task.id;

    try {
      setLoading(true);

      const formattedSubtasks = subtasks
        .filter((st) => st.title.trim() !== '')
        .map((st) => ({
          ...(st.id ? { id: st.id } : {}),
          title: st.title.trim(),
          is_completed: st.is_completed,
        }));

      const updatedTask = await updateTask(taskId, {
        title: title.trim(),
        description: description.trim() || null,
        column_id: Number(columnId),
        position: task.position,
        subtasks: formattedSubtasks,
      });

      updateTaskInBoard(updatedTask);
      onClose();
    } catch (error: unknown) {
      const message = axios.isAxiosError(error) ? error.response?.data?.message : undefined;
      console.error('Edit task error:', error);
      alert(message || 'Failed to update task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            <h3 className="text-lg font-bold text-[#000112] dark:text-white">Edit Task</h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-[#828FA3] dark:text-white mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 text-sm border border-[#828FA3]/25 rounded bg-transparent text-[#000112] dark:text-white focus:outline-none focus:border-[#635FC7]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#828FA3] dark:text-white mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 text-sm border border-[#828FA3]/25 rounded bg-transparent text-[#000112] dark:text-white focus:outline-none focus:border-[#635FC7] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#828FA3] dark:text-white mb-2">
                  Subtasks
                </label>
                <div className="space-y-3 max-h-36 overflow-y-auto pr-1">
                  {subtasks.map((st, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={st.title}
                        onChange={(e) => handleSubtaskChange(index, e.target.value)}
                        className="flex-1 px-4 py-2 text-sm border border-[#828FA3]/25 rounded bg-transparent text-[#000112] dark:text-white focus:outline-none focus:border-[#635FC7]"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSubtask(index)}
                        className="text-[#828FA3] hover:text-[#EA5555] font-bold cursor-pointer px-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleAddSubtask}
                  className="w-full mt-3 py-2 text-sm font-bold text-[#635FC7] bg-[#635FC7]/10 dark:bg-white rounded-full hover:bg-[#635FC7]/20 transition-colors cursor-pointer"
                >
                  + Add New Subtask
                </motion.button>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#828FA3] dark:text-white mb-2">
                  Status
                </label>
                <select
                  value={columnId}
                  onChange={(e) => setColumnId(e.target.value)}
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

              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 text-sm font-bold text-white bg-[#635FC7] hover:bg-[#A8A4FF] rounded-full transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-sm font-bold text-[#828FA3] bg-gray-100 dark:bg-gray-700 rounded-full hover:opacity-80 transition-opacity cursor-pointer"
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
