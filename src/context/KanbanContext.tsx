/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import type { Board, Column, Task, Subtask } from '../types/kanban';
import { getBoards, getBoardById } from '../api/kanbanApi';
import { useAuth } from './AuthContext';
import { useWorkspace } from './WorkspaceContext';
import { io, type Socket } from 'socket.io-client';
import type { WorkspaceRealtimeEvent } from '../types/realtime';

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
  subscribeWorkspaceEvents: (listener: (event: WorkspaceRealtimeEvent) => void) => () => void;
}

const KanbanContext = createContext<KanbanContextType | undefined>(undefined);

export const KanbanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { activeWorkspace, loading: workspaceLoading, refreshWorkspaces } = useWorkspace();
  const [boards, setBoards] = useState<Board[]>([]);
  const [activeBoard, setActiveBoardState] = useState<Board | null>(null);
  const [loading, setLoading] = useState(false);
  const hasSharedWorkspace = Boolean(activeWorkspace && activeWorkspace.type !== 'PERSONAL');
  const activeBoardRef = useRef<Board | null>(null);
  const activeWorkspaceRef = useRef(activeWorkspace);
  const socketRef = useRef<Socket | null>(null);
  const joinedWorkspaceRef = useRef<number | null>(null);
  const requestedWorkspaceRef = useRef<number | null>(null);
  const hasConnectedRef = useRef(false);
  const eventListenersRef = useRef(new Set<(event: WorkspaceRealtimeEvent) => void>());

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
  const fetchBoardsRef = useRef(fetchBoards);

  useLayoutEffect(() => {
    activeWorkspaceRef.current = activeWorkspace;
  }, [activeWorkspace]);

  useEffect(() => {
    fetchBoardsRef.current = fetchBoards;
  }, [fetchBoards]);

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
    updateBoardState((board) => board.columns.some((item) => item.id === column.id)
      ? board
      : { ...board, columns: [...board.columns, column] });
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
        tasks: column.tasks
          .filter((task) => task.id !== taskId)
          .map((task, index) => ({ ...task, position: index })),
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

  const subscribeWorkspaceEvents = useCallback((listener: (event: WorkspaceRealtimeEvent) => void) => {
    eventListenersRef.current.add(listener);
    return () => {
      eventListenersRef.current.delete(listener);
    };
  }, []);

  const replaceBoard = useCallback((board: Board, activateIfEmpty: boolean) => {
    setBoards((current) => current.some((item) => item.id === board.id)
      ? current.map((item) => item.id === board.id ? board : item)
      : [...current, board]);
    if (activeBoardRef.current?.id === board.id || (activateIfEmpty && !activeBoardRef.current)) setActiveBoard(board);
  }, [setActiveBoard]);

  const removeBoard = useCallback((boardId: number) => {
    setBoards((current) => current.filter((board) => board.id !== boardId));
    if (activeBoardRef.current?.id === boardId) {
      activeBoardRef.current = null;
      setActiveBoardState(null);
      void fetchBoardsRef.current().catch((error: unknown) => {
        console.error('Failed to select a board after deletion:', error);
      });
    }
  }, []);

  const applyWorkspaceEvent = useCallback((event: WorkspaceRealtimeEvent) => {
    const workspace = activeWorkspaceRef.current;
    if (!workspace || workspace.type === 'PERSONAL' || event.workspace_id !== workspace.id) return;

    switch (event.event) {
      case 'board.created':
        replaceBoard(event.payload, true);
        break;
      case 'board.updated':
        replaceBoard(event.payload, false);
        break;
      case 'board.deleted':
        removeBoard(event.payload.board_id);
        break;
      case 'column.created':
        if (activeBoardRef.current?.id === event.payload.board_id) addColumnToBoard(event.payload);
        break;
      case 'task.created':
      case 'task.updated':
      case 'task.assignees.updated':
        if (activeBoardRef.current?.id === event.payload.board_id) updateTaskInBoard(event.payload.task);
        break;
      case 'task.deleted':
        if (activeBoardRef.current?.id === event.payload.board_id) removeTaskFromBoard(event.payload.task_id);
        break;
      case 'subtask.updated':
        if (activeBoardRef.current?.id === event.payload.board_id) updateSubtaskInBoard(event.payload.subtask);
        break;
      case 'member.removed':
      case 'member.role.updated':
        if (event.payload.user_id === user?.id) {
          void refreshWorkspaces().catch((error: unknown) => {
            console.error('Failed to refresh workspace membership:', error);
          });
        }
        break;
      default:
        break;
    }
    eventListenersRef.current.forEach((listener) => listener(event));
  }, [addColumnToBoard, refreshWorkspaces, removeBoard, removeTaskFromBoard, replaceBoard, updateSubtaskInBoard, updateTaskInBoard, user?.id]);

  useEffect(() => {
    if (authLoading || !user || !hasSharedWorkspace) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    const socketOrigin = new URL(import.meta.env.VITE_API_URL || window.location.origin, window.location.origin).origin;
    const socket = io(socketOrigin, {
      autoConnect: false,
      auth: { token },
    });
    socketRef.current = socket;
    socket.on('connect', () => {
      const wasConnected = hasConnectedRef.current;
      hasConnectedRef.current = true;
      const workspace = activeWorkspaceRef.current;
      if (!workspace || workspace.type === 'PERSONAL') return;
      requestedWorkspaceRef.current = workspace.id;
      socket.emit('workspace:join', workspace.id, (result: { ok: boolean }) => {
        if (!result.ok) {
          if (requestedWorkspaceRef.current === workspace.id) requestedWorkspaceRef.current = null;
          console.error('Workspace real-time subscription was denied.');
          if (activeWorkspaceRef.current?.id === workspace.id) {
            void refreshWorkspaces().catch((error: unknown) => {
              console.error('Failed to refresh workspace membership:', error);
            });
          }
          return;
        }
        joinedWorkspaceRef.current = workspace.id;
        if (!wasConnected) return;
        const currentBoard = activeBoardRef.current;
        if (currentBoard?.workspace_id === workspace.id) {
          void getBoardById(currentBoard.id).then(setActiveBoard).catch((error: unknown) => {
            console.error('Failed to recover the active board after reconnecting:', error);
            void fetchBoardsRef.current().catch((refreshError: unknown) => {
              console.error('Failed to refresh boards after reconnecting:', refreshError);
            });
          });
        } else {
          void fetchBoardsRef.current().catch((error: unknown) => {
            console.error('Failed to refresh boards after reconnecting:', error);
          });
        }
      });
    });
    socket.on('disconnect', () => {
      joinedWorkspaceRef.current = null;
      requestedWorkspaceRef.current = null;
    });
    socket.on('connect_error', (error) => {
      console.error('Workspace real-time connection failed:', error.message);
    });
    socket.on('workspace:event', applyWorkspaceEvent);
    socket.connect();
    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      joinedWorkspaceRef.current = null;
      requestedWorkspaceRef.current = null;
      hasConnectedRef.current = false;
    };
  }, [applyWorkspaceEvent, authLoading, hasSharedWorkspace, refreshWorkspaces, setActiveBoard, user]);

  useLayoutEffect(() => {
    const socket = socketRef.current;
    if (!socket?.connected) return;
    const previousWorkspaceId = joinedWorkspaceRef.current ?? requestedWorkspaceRef.current;
    if (previousWorkspaceId && previousWorkspaceId !== activeWorkspace?.id) {
      socket.emit('workspace:leave', previousWorkspaceId);
      joinedWorkspaceRef.current = null;
      requestedWorkspaceRef.current = null;
    }
    if (!activeWorkspace || activeWorkspace.type === 'PERSONAL'
      || joinedWorkspaceRef.current === activeWorkspace.id) return;
    requestedWorkspaceRef.current = activeWorkspace.id;
    socket.emit('workspace:join', activeWorkspace.id, (result: { ok: boolean }) => {
      if (result.ok && activeWorkspaceRef.current?.id === activeWorkspace.id) {
        joinedWorkspaceRef.current = activeWorkspace.id;
      } else if (!result.ok) {
        if (requestedWorkspaceRef.current === activeWorkspace.id) requestedWorkspaceRef.current = null;
        console.error('Workspace real-time subscription was denied.');
        if (activeWorkspaceRef.current?.id === activeWorkspace.id) {
          void refreshWorkspaces().catch((error: unknown) => {
            console.error('Failed to refresh workspace membership:', error);
          });
        }
      }
    });
  }, [activeWorkspace, refreshWorkspaces]);

  return (
    <KanbanContext.Provider value={{
      boards, activeBoard, loading, fetchBoards, selectBoard, setActiveBoard,
      addColumnToBoard, updateTaskInBoard, removeTaskFromBoard, updateSubtaskInBoard,
      subscribeWorkspaceEvents,
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
