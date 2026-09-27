import React, { useState } from 'react';
import axios from 'axios';
import { addColumn } from '../../api/kanbanApi';
import { useKanban } from '../../context/KanbanContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useWorkspace } from '../../context/WorkspaceContext';
import { canManageColumn, workspaceManagementPermissionMessage } from '../../utils/workspacePermissions';

interface AddColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddColumnModal: React.FC<AddColumnModalProps> = ({ isOpen, onClose }) => {
  const { activeBoard, addColumnToBoard } = useKanban();
  const { activeWorkspace } = useWorkspace();
  const canManageColumns = canManageColumn(activeWorkspace);
  const { t } = useTranslation();
  const [columnTitle, setColumnTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !activeBoard) return null;

  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageColumns || !columnTitle.trim()) return;

    try {
      setIsSubmitting(true);
      const column = await addColumn(activeBoard.id, columnTitle.trim());
      addColumnToBoard(column);

      setColumnTitle('');
      onClose();
    } catch (error: unknown) {
      const message = axios.isAxiosError(error) ? error.response?.data?.message : undefined;
      console.error('Failed to add column:', error);
      alert(message || t('common.failedAddColumn'));
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
              {t('modal.addColumn')}
            </h2>

            <form onSubmit={handleAddColumn} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#828FA3] dark:text-white">
                  {t('common.columnName')}
                </label>
                <input
                  type="text"
                  value={columnTitle}
                  onChange={(e) => setColumnTitle(e.target.value)}
                  disabled={!canManageColumns}
                  title={!canManageColumns ? workspaceManagementPermissionMessage : undefined}
                  placeholder={t('modal.newColumnPlaceholder')}
                  required
                  className="w-full px-4 py-3 text-sm font-semibold border border-[#828FA3]/25 rounded-md bg-transparent text-[#000112] dark:text-white focus:outline-none focus:border-[#635FC7] disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <motion.button
                whileHover={canManageColumns ? { scale: 1.02 } : undefined}
                whileTap={canManageColumns ? { scale: 0.98 } : undefined}
                type="submit"
                disabled={isSubmitting || !columnTitle.trim() || !canManageColumns}
                title={!canManageColumns ? workspaceManagementPermissionMessage : undefined}
                className={`w-full py-3 bg-[#635FC7] text-white font-bold text-sm rounded-full transition-colors ${
                  canManageColumns ? 'hover:bg-[#A8A4FF] cursor-pointer' : 'opacity-50 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? t('common.adding') : t('modal.createColumn')}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};