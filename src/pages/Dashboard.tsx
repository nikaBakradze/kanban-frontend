import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { BoardView } from '../components/BoardView';
import { CreateBoardModal } from '../components/modals/CreateBoardModal';
import { AddTaskModal } from '../components/modals/AddTaskModal';
import { AddColumnModal } from '../components/modals/AddColumnModal';
import { EditBoardModal } from '../components/modals/EditBoardModal';
import showSidebarIcon from '../assets/show sidebar.svg';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const { logout } = useAuth();
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [isEditBoardOpen, setIsEditBoardOpen] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen flex bg-white dark:bg-[#2B2C37] overflow-hidden transition-colors duration-200">
      {/* Mobile Backdrop & Sidebar Container */}
      <AnimatePresence>
        {isSidebarVisible && (
          <>
            {/* Backdrop for Mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarVisible(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            {/* Sidebar Motion Drawer */}
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="fixed md:relative inset-y-0 left-0 z-50 h-full shrink-0 shadow-2xl md:shadow-none"
            >
              <Sidebar
                onOpenNewBoardModal={() => setIsCreateBoardOpen(true)}
                onHideSidebar={() => setIsSidebarVisible(false)}
                isDarkMode={isDarkMode}
                toggleTheme={toggleTheme}
                onLogout={logout}
                showBrand={isSidebarVisible}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Show Sidebar Floating Button */}
      <AnimatePresence>
        {!isSidebarVisible && (
          <>
            <motion.button
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsSidebarVisible(true)}
              className="fixed bottom-8 left-0 bg-[#635FC7] hover:bg-[#A8A4FF] text-white px-4 md:px-5 py-3.5 md:py-4 rounded-r-full transition-colors z-50 shadow-lg flex items-center justify-center cursor-pointer"
            >
              <img src={showSidebarIcon} alt="Show Sidebar" className="w-4 h-4" />
            </motion.button>
          </>
        )}
      </AnimatePresence>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-[#2B2C37] transition-colors duration-200 w-full">
        <Header
          onOpenAddTaskModal={() => setIsAddTaskOpen(true)}
          onOpenEditBoardModal={() => setIsEditBoardOpen(true)}
          sidebarVisible={isSidebarVisible}
          onLogout={logout}
        />
        <main className="flex-1 overflow-x-auto bg-[#F4F7FD] dark:bg-[#20212C] transition-colors duration-200">
          <BoardView
            onOpenAddColumnModal={() => setIsAddColumnOpen(true)}
            onOpenCreateBoardModal={() => setIsCreateBoardOpen(true)}
          />
        </main>
      </div>

      <CreateBoardModal
        isOpen={isCreateBoardOpen}
        onClose={() => setIsCreateBoardOpen(false)}
      />

      <AddTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
      />

      <AddColumnModal
        isOpen={isAddColumnOpen}
        onClose={() => setIsAddColumnOpen(false)}
      />

      <EditBoardModal
        isOpen={isEditBoardOpen}
        onClose={() => setIsEditBoardOpen(false)}
      />
    </div>
  );
}