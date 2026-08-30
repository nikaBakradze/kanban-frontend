/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { useKanban } from '../../context/KanbanContext';
import { motion, AnimatePresence } from 'framer-motion';

interface EditBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditBoardModal: React.FC<EditBoardModalProps> = ({ isOpen, onClose }) => {
  const { activeBoard, selectBoard } = useKanban();
  const [boardTitle, setBoardTitle] = useState('');
  const [columns, setColumns] = useState<{ id?: number | string; title: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (activeBoard) {
      setBoardTitle(activeBoard.title || '');
      setColumns(
        activeBoard.columns?.map((col: any) => ({
          id: col.id || col._id,
          title: col.title,
        })) || []
      );
    }
  }, [activeBoard, isOpen]);

  if (!isOpen || !activeBoard) return null;

  const handleColumnChange = (index: number, value: string) => {
    const updated = [...columns];
    updated[index].title = value;
    setColumns(updated);
  };

  const handleAddColumn = () => {
    setColumns([...columns, { title: '' }]);
  };

  const handleRemoveColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boardTitle.trim()) return;

    try {
      setIsSubmitting(true);
      const boardId = Number(activeBoard.id || (activeBoard as any)._id);

      const filteredColumns = columns.filter((col) => col.title.trim() !== '');

      await API.put(`/boards/${boardId}`, {
        title: boardTitle.trim(),
        columns: filteredColumns,
      });

      await selectBoard(boardId);
      onClose();
    } catch (error: any) {
      console.error('Failed to update board:', error.response?.data || error.message);
      alert(`შეცდომა დაფის განახლებისას: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
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
            <h2 className="text-lg font-bold text-[#000112] dark:text-white">
              Edit Board
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#828FA3] dark:text-white">
                  Board Name
                </label>
                <input
                  type="text"
                  value={boardTitle}
                  onChange={(e) => setBoardTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 text-sm font-semibold border border-[#828FA3]/25 rounded-md bg-transparent text-[#000112] dark:text-white focus:outline-none focus:border-[#635FC7]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#828FA3] dark:text-white">
                  Board Columns
                </label>
                <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                  {columns.map((col, index) => (
                    <div key={col.id || index} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={col.title}
                        onChange={(e) => handleColumnChange(index, e.target.value)}
                        required
                        className="flex-1 px-4 py-2.5 text-sm font-semibold border border-[#828FA3]/25 rounded-md bg-transparent text-[#000112] dark:text-white focus:outline-none focus:border-[#635FC7]"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveColumn(index)}
                        className="text-[#828FA3] hover:text-[#EA5555] p-2 cursor-pointer transition-colors font-bold text-lg"
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
                  className="w-full py-3 bg-[#635FC7]/10 dark:bg-white text-[#635FC7] hover:bg-[#635FC7]/20 font-bold text-sm rounded-full transition-colors cursor-pointer mt-2"
                >
                  + Add New Column
                </motion.button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#635FC7] hover:bg-[#A8A4FF] text-white font-bold text-sm rounded-full transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};