import API from './axios'; // შენს არსებულ axios ფაილს იყენებს
import type { Board } from '../types/kanban';

export const getBoards = async (): Promise<Board[]> => {
  const response = await API.get('/boards');
  return response.data;
};

export const getBoardById = async (id: number): Promise<Board> => {
  const response = await API.get(`/boards/${id}`);
  return response.data;
};

export const createBoard = async (data: { title: string; columns: string[] }) => {
  const response = await API.post('/boards', data);
  return response.data;
};

export const deleteBoard = async (id: number) => {
  const response = await API.delete(`/boards/${id}`);
  return response.data;
};

export const createTask = async (data: { title: string; description?: string; column_id: number; subtasks?: string[] }) => {
  const response = await API.post('/tasks', data);
  return response.data;
};

export const toggleSubtask = async (id: number, is_completed: boolean) => {
  const response = await API.patch(`/tasks/subtask/${id}`, { is_completed });
  return response.data;
};

export const deleteTask = async (id: number) => {
  const response = await API.delete(`/tasks/${id}`);
  return response.data;
};