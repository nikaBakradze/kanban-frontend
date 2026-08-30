import React from 'react';
import { useKanban } from '../context/KanbanContext';
import kanbanLogo from '../assets/kanban-logo.svg';
import hideSidebarIcon from '../assets/hide sidebar.svg';
import createBoardActiveIcon from '../assets/create new board active.svg';
import createBoardInactiveIcon from '../assets/create new board inactive.svg';
import lightThemeIcon from '../assets/light mode icon.svg';
import darkThemeIcon from '../assets/dark mode icon.svg';
import logoutIcon from '../assets/logout-16.ico';
import { motion } from 'framer-motion';

interface SidebarProps {
  onOpenNewBoardModal: () => void;
  onHideSidebar: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenNewBoardModal,
  onHideSidebar,
  isDarkMode,
  toggleTheme,
  onLogout,
}) => {
  const { boards, activeBoard, selectBoard } = useKanban();

  return (
    <aside className="w-[280px] md:w-[300px] bg-white dark:bg-[#2B2C37] border-r border-[#E4E8F1] dark:border-[#3E3F4E] flex flex-col justify-between h-full shrink-0 pb-6 pr-4 md:pr-6 transition-colors duration-200">
      <div className="overflow-y-auto flex-1">
        <div className="h-20 md:h-24 flex items-center gap-4 pl-6 md:pl-8">
          <img src={kanbanLogo} alt="Kanban" className="w-6 h-6" />
          <h1 className="text-2xl md:text-3xl font-bold text-[#000112] dark:text-white tracking-wide">
            kanban
          </h1>
        </div>

        <p className="text-xs font-bold text-[#828FA3] uppercase tracking-[2.4px] mb-4 md:mb-5 pl-6 md:pl-8">
          ALL BOARDS ({boards.length})
        </p>

        <div className="space-y-1">
          {boards.map((board) => {
            const isActive = activeBoard?.id === board.id;
            return (
              <motion.button
                key={board.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => selectBoard(board.id)}
                className={`w-full flex items-center gap-4 pl-6 md:pl-8 py-3.5 rounded-r-full font-bold text-[15px] transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#635FC7] text-white'
                    : 'text-[#828FA3] hover:bg-[#635FC7]/10 hover:text-[#635FC7] dark:hover:bg-white dark:hover:text-[#635FC7]'
                }`}
              >
                <img
                  src={isActive ? createBoardActiveIcon : createBoardInactiveIcon}
                  alt="Board Icon"
                  className="w-4 h-4 shrink-0"
                />
                <span className="truncate">{board.title}</span>
              </motion.button>
            );
          })}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenNewBoardModal}
            className="w-full flex items-center gap-4 pl-6 md:pl-8 py-3.5 text-[#635FC7] font-bold text-[15px] hover:opacity-80 transition-opacity cursor-pointer group"
          >
            <img
              src={createBoardActiveIcon}
              alt="Create Board Icon"
              className="w-4 h-4 shrink-0"
            />
            <span>+ Create New Board</span>
          </motion.button>
        </div>
      </div>

      <div className="pl-6 md:pl-8 space-y-2 pt-4 shrink-0">
        <div className="bg-[#F4F7FD] dark:bg-[#20212C] rounded-md py-3.5 flex items-center justify-center gap-6 transition-colors duration-200">
          <img src={lightThemeIcon} alt="Light Theme" className="w-5 h-5" />
          
          <button
            type="button"
            onClick={toggleTheme}
            className="w-10 h-5 bg-[#635FC7] hover:bg-[#A8A4FF] rounded-full p-1 relative flex items-center cursor-pointer transition-colors"
          >
            <motion.div
              className="w-3.5 h-3.5 bg-white rounded-full"
              animate={{ x: isDarkMode ? 20 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>

          <img src={darkThemeIcon} alt="Dark Theme" className="w-4 h-4" />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onLogout}
          className="flex items-center gap-4 text-[#EA5555] font-bold text-[15px] hover:bg-[#EA5555]/10 w-full py-3 pl-4 rounded-r-full transition-colors cursor-pointer"
        >
          <img src={logoutIcon} alt="Logout" className="w-4 h-4 shrink-0" />
          <span>Logout</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onHideSidebar}
          className="flex items-center gap-4 text-[#828FA3] font-bold text-[15px] hover:text-[#635FC7] dark:hover:bg-[#635FC7]/10 w-full py-3 rounded-r-full transition-colors cursor-pointer"
        >
          <img src={hideSidebarIcon} alt="Hide Sidebar" className="w-4 h-4 shrink-0" />
          <span>Hide Sidebar</span>
        </motion.button>
      </div>
    </aside>
  );
};