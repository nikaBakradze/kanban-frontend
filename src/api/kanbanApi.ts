import API from './axios';
import type { Board, Column, Subtask, Task } from '../types/kanban';

export interface SubtaskInput {
  id?: number;
  title: string;
  is_completed?: boolean;
}

export interface TaskInput {
  title: string;
  description?: string | null;
  column_id: number;
  position?: number;
  subtasks?: SubtaskInput[];
}

export interface TaskUpdateInput {
  title?: string;
  description?: string | null;
  column_id?: number;
  position?: number;
  subtasks?: SubtaskInput[];
}

const unwrap = <T,>(data: T & { board?: T; task?: T; column?: T }): T =>
  data.board ?? data.task ?? data.column ?? data;

const normalizeTask = (task: Task): Task => ({
  ...task,
  id: Number(task.id),
  column_id: Number(task.column_id),
  position: Number(task.position),
  subtasks: (task.subtasks || []).map((subtask) => ({
    ...subtask,
    id: Number(subtask.id),
    task_id: Number(subtask.task_id),
    is_completed: Boolean(Number(subtask.is_completed)),
  })),
});

const normalizeBoard = (board: Board): Board => ({
  ...board,
  id: Number(board.id),
  user_id: Number(board.user_id),
  columns: (board.columns || []).map((column) => ({
    ...column,
    id: Number(column.id),
    board_id: Number(column.board_id),
    position: Number(column.position),
    tasks: (column.tasks || []).map(normalizeTask),
  })),
});

export const getBoards = async (): Promise<Board[]> => {
  const { data } = await API.get<Board[]>('/api/boards');
  return data.map(normalizeBoard);
};

export const getBoardById = async (id: number): Promise<Board> => {
  const { data } = await API.get<Board>(`/api/boards/${id}`);
  return normalizeBoard(data);
};

export const createBoard = async (data: { title: string; columns: string[] }): Promise<Board> => {
  const response = await API.post('/api/boards', data);
  return normalizeBoard(unwrap(response.data));
};

export const updateBoard = async (
  id: number,
  data: { title: string; columns: { id: number; title: string }[] },
): Promise<Board> => {
  const response = await API.put(`/api/boards/${id}`, data);
  return normalizeBoard(unwrap(response.data));
};

export const deleteBoard = async (id: number): Promise<void> => {
  await API.delete(`/api/boards/${id}`);
};

export const addColumn = async (boardId: number, title: string): Promise<Column> => {
  const response = await API.post(`/api/boards/${boardId}/columns`, { title });
  return unwrap(response.data);
};

export const createTask = async (data: TaskInput): Promise<Task> => {
  const response = await API.post('/api/tasks', data);
  return normalizeTask(unwrap(response.data));
};

export const updateTask = async (id: number, data: TaskUpdateInput): Promise<Task> => {
  const response = await API.put(`/api/tasks/${id}`, data);
  return normalizeTask(unwrap(response.data));
};

export const deleteTask = async (id: number): Promise<void> => {
  await API.delete(`/api/tasks/${id}`);
};

export const toggleSubtask = async (id: number, is_completed: boolean): Promise<Subtask> => {
  const response = await API.patch(`/api/tasks/subtask/${id}`, { is_completed });
  return unwrap(response.data);
};
