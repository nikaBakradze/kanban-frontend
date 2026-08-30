/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { createTask } from '../../api/kanbanApi';
import { useKanban } from '../../context/KanbanContext';
import { motion, AnimatePresence } from 'framer-motion';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose }) => {
  const { activeBoard, fetchBoards, selectBoard } = useKanban();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [columnId, setColumnId] = useState<number | string>('');
  const [subtasks, setSubtasks] = useState<string[]>(['', '']);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !activeBoard) return null;

  const effectiveColumnId = columnId || (activeBoard.columns?.[0]?.id ?? (activeBoard.columns?.[0] as any)?._id);

  const handleSubtaskChange = (index: number, value: string) => {
    const updated = [...subtasks];
    updated[index] = value;
    setSubtasks(updated);
  };

  const handleAddSubtask = () => setSubtasks([...subtasks, '']);
  const handleRemoveSubtask = (index: number) => setSubtasks(subtasks.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetColumnId = Number(effectiveColumnId);
    if (!title.trim() || !targetColumnId || isNaN(targetColumnId)) return;

    try {
      setLoading(true);
      const filteredSubtasks = subtasks.filter((st) => st.trim() !== '');
      
      await createTask({
        title,
        description,
        column_id: targetColumnId,
        subtasks: filteredSubtasks,
      });

      const boardId = Number(activeBoard.id || (activeBoard as any)._id);
      await selectBoard(boardId);
      await fetchBoards();

      setTitle('');
      setDescription('');
      setSubtasks(['', '']);
      setColumnId('');
      onClose();
    } catch (error: any) {
      console.error('Failed to create task:', error.response?.data || error.message);
      alert(`ვერ მოხერხდა ამოცანის შექმნა: ${error.response?.data?.message || error.message}`);
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
            className="bg-white dark:bg-[#2B2C37] w-full max-w-md rounded-lg p-6 md:p-8 space-y-6 shadow-xl cursor-default max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-lg font-bold text-[#000112] dark:text-white">Add New Task</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#828FA3] mb-2 dark:text-white">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Take coffee break"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 text-sm border border-[#828FA3]/25 rounded bg-transparent text-[#000112] dark:text-white focus:outline-none focus:border-[#635FC7]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#828FA3] mb-2 dark:text-white">Description</label>
                <textarea
                  placeholder="e.g. It's always good to take a 5 min break."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 text-sm border border-[#828FA3]/25 rounded bg-transparent text-[#000112] dark:text-white focus:outline-none focus:border-[#635FC7] h-20 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#828FA3] mb-2 dark:text-white">Subtasks</label>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                  {subtasks.map((st, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={st}
                        onChange={(e) => handleSubtaskChange(index, e.target.value)}
                        className="flex-1 px-4 py-2 text-sm border border-[#828FA3]/25 rounded bg-transparent text-[#000112] dark:text-white focus:outline-none focus:border-[#635FC7]"
                      />
                      <button type="button" onClick={() => handleRemoveSubtask(index)} className="text-[#828FA3] hover:text-[#EA5555]">✕</button>
                    </div>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleAddSubtask}
                  className="w-full mt-2 py-2 text-sm font-bold text-[#635FC7] bg-[#635FC7]/10 dark:bg-white rounded-full cursor-pointer"
                >
                  + Add New Subtask
                </motion.button>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#828FA3] mb-2 dark:text-white">Status</label>
                <select
                  value={effectiveColumnId}
                  onChange={(e) => setColumnId(e.target.value)}
                  className="w-full px-4 py-2 text-sm border border-[#828FA3]/25 rounded bg-white dark:bg-[#2B2C37] text-[#000112] dark:text-white focus:outline-none focus:border-[#635FC7] cursor-pointer"
                >
                  {activeBoard.columns?.map((col: any) => (
                    <option key={col.id || col._id} value={col.id || col._id}>
                      {col.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 md:py-2 text-sm font-bold text-white bg-[#635FC7] hover:bg-[#A8A4FF] rounded-full disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Creating...' : 'Create Task'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 md:py-2 text-sm font-bold text-[#828FA3] bg-gray-100 dark:bg-gray-700 rounded-full cursor-pointer"
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