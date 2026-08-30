import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Board } from '../types/kanban';
import { getBoards, getBoardById } from '../api/kanbanApi';

interface KanbanContextType {
  boards: Board[];
  activeBoard: Board | null;
  loading: boolean;
  fetchBoards: () => Promise<void>;
  selectBoard: (id: number) => Promise<void>;
}

const KanbanContext = createContext<KanbanContextType | undefined>(undefined);

export const KanbanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [activeBoard, setActiveBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // კონკრეტული დაფის წამოღება ID-ით
  const selectBoard = useCallback(async (id: number) => {
    try {
      const fullBoard = await getBoardById(id);
      setActiveBoard({ ...fullBoard });
    } catch (error) {
      console.error('Failed to fetch active board:', error);
    }
  }, []);

  // ყველა დაფის წამოღება
  const fetchBoards = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getBoards();
      setBoards(data);

      if (data && data.length > 0) {
        const firstBoardId = Number(data[0].id);
        await selectBoard(firstBoardId);
      } else {
        setActiveBoard(null);
      }
    } catch (error) {
      console.error('Failed to fetch boards:', error);
    } finally {
      setLoading(false);
    }
  }, [selectBoard]);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  return (
    <KanbanContext.Provider value={{ boards, activeBoard, loading, fetchBoards, selectBoard }}>
      {children}
    </KanbanContext.Provider>
  );
};

export const useKanban = () => {
  const context = useContext(KanbanContext);
  if (!context) throw new Error('useKanban must be used within a KanbanProvider');
  return context;
};