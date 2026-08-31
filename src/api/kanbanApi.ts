import API from './axios';
import type { Board } from '../types/kanban';

export const getBoards = async (): Promise<Board[]> => {
  const response = await API.get('/api/boards');
  return response.data;
};

export const getBoardById = async (id: number): Promise<Board> => {
  const response = await API.get(`/api/boards/${id}`);
  return response.data;
};

export const createBoard = async (data: { title: string; columns: string[] }) => {
  const response = await API.post('/api/boards', data);
  return response.data;
};

export const deleteBoard = async (id: number) => {
  const response = await API.delete(`/api/boards/${id}`);
  return response.data;
};

export const createTask = async (data: { title: string; description?: string; column_id: number; subtasks?: string[] }) => {
  const response = await API.post('/api/tasks', data);
  return response.data;
};

export const toggleSubtask = async (id: number, is_completed: boolean) => {
  const response = await API.patch(`/api/tasks/subtask/${id}`, { is_completed });
  return response.data;
};

export const deleteTask = async (id: number) => {
  const response = await API.delete(`/api/tasks/${id}`);
  return response.data;
};
