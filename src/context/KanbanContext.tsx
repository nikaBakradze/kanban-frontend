/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { Board, Column, Task, Subtask } from '../types/kanban';
import { getBoards, getBoardById } from '../api/kanbanApi';
import { useAuth } from './AuthContext';
import { useWorkspace } from './WorkspaceContext';

interface KanbanContextType {
  boards: Board[];
  activeBoard: Board | null;
  loading: boolean;
  fetchBoards: (preferredBoardId?: number) => Promise<void>;
  selectBoard: (id: number) => Promise<void>;
  setActiveBoard: (board: Board) => void;
  addColumnToBoard: (column: Column) => void;
  updateTaskInBoard: (task: Task) => void;
  removeTaskFromBoard: (taskId: number) => void;
  updateSubtaskInBoard: (subtask: Subtask) => void;
}

const KanbanContext = createContext<KanbanContextType | undefined>(undefined);

export const KanbanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { activeWorkspace, loading: workspaceLoading } = useWorkspace();
  const [boards, setBoards] = useState<Board[]>([]);
  const [activeBoard, setActiveBoardState] = useState<Board | null>(null);
  const [loading, setLoading] = useState(false);
  const activeBoardRef = useRef<Board | null>(null);

  const setActiveBoard = useCallback((board: Board) => {
    activeBoardRef.current = board;
    setActiveBoardState(board);
  }, []);

  const selectBoard = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const fullBoard = await getBoardById(id);
      setActiveBoard(fullBoard);
    } finally {
      setLoading(false);
    }
  }, [setActiveBoard]);

  const fetchBoards = useCallback(async (preferredBoardId?: number) => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getBoards();
      const workspaceBoards = data.filter((board) => activeWorkspace?.type === 'PERSONAL'
        ? board.workspace_id == null
        : board.workspace_id === activeWorkspace?.id);
      setBoards(workspaceBoards);
      const currentId = preferredBoardId ?? activeBoardRef.current?.id;
      const boardToSelect = workspaceBoards.find((board) => board.id === currentId) ?? workspaceBoards[0];
      if (boardToSelect) {
        await selectBoard(boardToSelect.id);
      } else {
        setActiveBoardState(null);
        activeBoardRef.current = null;
      }
    } finally {
      setLoading(false);
    }
  }, [activeWorkspace, selectBoard, user]);

  useEffect(() => {
    if (authLoading || workspaceLoading) return;
    if (user && activeWorkspace) {
      void fetchBoards();
    } else {
      setBoards([]);
      activeBoardRef.current = null;
      setActiveBoardState(null);
      setLoading(false);
    }
  }, [activeWorkspace, authLoading, fetchBoards, user, workspaceLoading]);

  const updateBoardState = useCallback((transform: (board: Board) => Board) => {
    const current = activeBoardRef.current;
    if (!current) return;
    const next = transform(current);
    setActiveBoard(next);
    setBoards((prev) => prev.map((board) => (board.id === next.id ? { ...board, title: next.title } : board)));
  }, [setActiveBoard]);

  const addColumnToBoard = useCallback((column: Column) => {
    updateBoardState((board) => ({ ...board, columns: [...board.columns, column] }));
  }, [updateBoardState]);

  const updateTaskInBoard = useCallback((task: Task) => {
    updateBoardState((board) => {
      const targetColumn = board.columns.find((column) => column.id === task.column_id);
      if (!targetColumn) return board;

      return {
        ...board,
        columns: board.columns.map((column) => {
          const remaining = column.tasks.filter((item) => item.id !== task.id);
          if (column.id !== task.column_id) {
            return {
              ...column,
              tasks: remaining.map((item, index) => ({ ...item, position: index })),
            };
          }

          const position = Math.max(0, Math.min(task.position, remaining.length));
          remaining.splice(position, 0, task);
          return {
            ...column,
            tasks: remaining.map((item, index) => ({ ...item, position: index })),
          };
        }),
      };
    });
  }, [updateBoardState]);

  const removeTaskFromBoard = useCallback((taskId: number) => {
    updateBoardState((board) => ({
      ...board,
      columns: board.columns.map((column) => ({
        ...column,
        tasks: column.tasks.filter((task) => task.id !== taskId),
      })),
    }));
  }, [updateBoardState]);

  const updateSubtaskInBoard = useCallback((subtask: Subtask) => {
    updateBoardState((board) => ({
      ...board,
      columns: board.columns.map((column) => ({
        ...column,
        tasks: column.tasks.map((task) => ({
          ...task,
          subtasks: task.subtasks.map((item) => item.id === subtask.id ? subtask : item),
        })),
      })),
    }));
  }, [updateBoardState]);

  return (
    <KanbanContext.Provider value={{
      boards, activeBoard, loading, fetchBoards, selectBoard, setActiveBoard,
      addColumnToBoard, updateTaskInBoard, removeTaskFromBoard, updateSubtaskInBoard,
    }}>
      {children}
    </KanbanContext.Provider>
  );
};

export const useKanban = () => {
  const context = useContext(KanbanContext);
  if (!context) throw new Error('useKanban must be used within a KanbanProvider');
  return context;
};
