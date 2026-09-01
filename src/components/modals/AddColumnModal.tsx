import React, { useState } from 'react';
import axios from 'axios';
import { addColumn } from '../../api/kanbanApi';
import { useKanban } from '../../context/KanbanContext';
import { motion, AnimatePresence } from 'framer-motion';

interface AddColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddColumnModal: React.FC<AddColumnModalProps> = ({ isOpen, onClose }) => {
  const { activeBoard, addColumnToBoard } = useKanban();
  const [columnTitle, setColumnTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !activeBoard) return null;

  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!columnTitle.trim()) return;

    try {
      setIsSubmitting(true);
      const column = await addColumn(activeBoard.id, columnTitle.trim());
      addColumnToBoard(column);

      setColumnTitle('');
      onClose();
    } catch (error: unknown) {
      const message = axios.isAxiosError(error) ? error.response?.data?.message : undefined;
      console.error('Failed to add column:', error);
      alert(message || 'Failed to add column.');
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
            className="bg-white dark:bg-[#2B2C37] w-full max-w-md rounded-lg p-6 md:p-8 space-y-6 cursor-default relative shadow-xl max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-lg font-bold text-[#000112] dark:text-white">
              Add New Column
            </h2>

            <form onSubmit={handleAddColumn} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#828FA3] dark:text-white">
                  Column Name
                </label>
                <input
                  type="text"
                  value={columnTitle}
                  onChange={(e) => setColumnTitle(e.target.value)}
                  placeholder="e.g. Review"
                  required
                  className="w-full px-4 py-3 text-sm font-semibold border border-[#828FA3]/25 rounded-md bg-transparent text-[#000112] dark:text-white focus:outline-none focus:border-[#635FC7]"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting || !columnTitle.trim()}
                className="w-full py-3 bg-[#635FC7] hover:bg-[#A8A4FF] text-white font-bold text-sm rounded-full transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Adding...' : 'Create Column'}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};