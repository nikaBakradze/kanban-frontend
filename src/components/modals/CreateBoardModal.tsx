import React, { useState } from 'react';
import { createBoard } from '../../api/kanbanApi';
import { useKanban } from '../../context/KanbanContext';
import { motion, AnimatePresence } from 'framer-motion';

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateBoardModal: React.FC<CreateBoardModalProps> = ({ isOpen, onClose }) => {
  const { fetchBoards } = useKanban();
  const [title, setTitle] = useState('');
  const [columns, setColumns] = useState<string[]>(['Todo', 'Doing', 'Done']);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleColumnChange = (index: number, value: string) => {
    const updated = [...columns];
    updated[index] = value;
    setColumns(updated);
  };

  const handleAddColumn = () => {
    setColumns([...columns, '']);
  };

  const handleRemoveColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setLoading(true);
      const filteredColumns = columns.filter((col) => col.trim() !== '');
      const board = await createBoard({ title: title.trim(), columns: filteredColumns });
      await fetchBoards(board.id);
      setTitle('');
      setColumns(['Todo', 'Doing', 'Done']);
      onClose();
    } catch (error) {
      console.error('Failed to create board:', error);
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
            className="bg-white dark:bg-[#2B2C37] w-full max-w-md rounded-lg p-6 md:p-8 space-y-6 cursor-default relative shadow-xl max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-lg font-bold text-[#000112] dark:text-white">Add New Board</h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-[#828FA3] mb-2 dark:text-white">
                  Board Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Web Design"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 text-sm border border-[#828FA3]/25 rounded bg-transparent text-[#000112] dark:text-white focus:outline-none focus:border-[#635FC7]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#828FA3] mb-2 dark:text-white">
                  Board Columns
                </label>
                <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                  {columns.map((col, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={col}
                        onChange={(e) => handleColumnChange(index, e.target.value)}
                        className="flex-1 px-4 py-2 text-sm border border-[#828FA3]/25 rounded bg-transparent text-[#000112] dark:text-white focus:outline-none focus:border-[#635FC7]"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveColumn(index)}
                        className="text-[#828FA3] hover:text-[#EA5555] font-bold cursor-pointer"
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
                  onClick={handleAddColumn}
                  className="w-full mt-3 py-2 text-sm font-bold text-[#635FC7] bg-[#635FC7]/10 dark:bg-white rounded-full hover:bg-[#635FC7]/20 transition-colors cursor-pointer"
                >
                  + Add New Column
                </motion.button>
              </div>

              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 md:py-2 text-sm font-bold text-white bg-[#635FC7] hover:bg-[#A8A4FF] rounded-full transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Creating...' : 'Create New Board'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 md:py-2 text-sm font-bold text-[#828FA3] bg-gray-100 dark:bg-gray-700 rounded-full hover:opacity-80 transition-opacity cursor-pointer"
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