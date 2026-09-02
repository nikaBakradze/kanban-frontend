import React, { useState } from 'react';
import axios from 'axios';
import { useKanban } from '../context/KanbanContext';
import { deleteBoard } from '../api/kanbanApi';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  onOpenAddTaskModal: () => void;
  onOpenEditBoardModal: () => void;
  showBoardTitle?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddTaskModal,
  onOpenEditBoardModal,
  showBoardTitle = true,
}) => {
  const { activeBoard, fetchBoards } = useKanban();
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const boardId = activeBoard?.id ?? null;
  const hasColumns = activeBoard?.columns && activeBoard.columns.length > 0;

  const handleDeleteBoard = async () => {
    if (!boardId) return;

    try {
      setIsDeleting(true);
      await deleteBoard(boardId);
      setIsDeleteModalOpen(false);
      setShowMenu(false);
      await fetchBoards();
    } catch (error: unknown) {
      const message = axios.isAxiosError(error) ? error.response?.data?.message : undefined;
      console.error('Failed to delete board:', error);
      alert(message || 'Failed to delete board.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <header className="h-24 bg-white dark:bg-[#2B2C37] px-6 flex items-center justify-between border-b border-[#E4EBFA] dark:border-[#3E3F4E]">
        {showBoardTitle && (
          <h1 className="text-xl md:text-2xl font-bold text-[#000112] dark:text-white truncate">
            {activeBoard ? activeBoard.title : 'No Active Board'}
          </h1>
        )}

        <div className="flex items-center gap-4 relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenAddTaskModal}
            disabled={!hasColumns}
            className="bg-[#635FC7] hover:bg-[#A8A4FF] disabled:opacity-50 text-white font-bold text-sm md:text-[15px] px-4 py-3 rounded-full cursor-pointer transition-colors flex items-center gap-1"
          >
            <span>+ Add New Task</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMenu((prev) => !prev)}
            disabled={!activeBoard}
            className="p-2 hover:bg-gray-100 dark:hover:bg-[#20212C] rounded-full transition-colors cursor-pointer disabled:opacity-30"
          >
            <svg width="5" height="20" viewBox="0 0 5 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="2.30769" cy="2.30769" r="2.30769" fill="#828FA3"/>
              <circle cx="2.30769" cy="10" r="2.30769" fill="#828FA3"/>
              <circle cx="2.30769" cy="17.6923" r="2.30769" fill="#828FA3"/>
            </svg>
          </motion.button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 top-14 w-48 bg-white dark:bg-[#20212C] shadow-xl rounded-xl p-4 space-y-4 z-50 border border-gray-100 dark:border-gray-800"
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onOpenEditBoardModal();
                  }}
                  className="w-full text-left text-sm font-semibold text-[#828FA3] hover:text-[#635FC7] transition-colors cursor-pointer"
                >
                  Edit Board
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    setIsDeleteModalOpen(true);
                  }}
                  className="w-full text-left text-sm font-semibold text-[#EA5555] hover:opacity-80 transition-opacity cursor-pointer"
                >
                  Delete Board
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

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
              className="bg-white dark:bg-[#2B2C37] w-full max-w-120 rounded-lg p-8 space-y-6 cursor-default relative shadow-xl"
            >
              <h3 className="text-lg font-bold text-[#EA5555]">
                Delete this board?
              </h3>
              <p className="text-sm text-[#828FA3] leading-relaxed">
                Are you sure you want to delete the '{activeBoard?.title}' board? This action will remove all columns and tasks and cannot be reversed.
              </p>

              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleDeleteBoard}
                  disabled={isDeleting}
                  className="flex-1 py-3 text-sm font-bold text-white bg-[#EA5555] hover:bg-[#FF9898] rounded-full transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
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