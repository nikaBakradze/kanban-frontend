export interface Subtask {
  id?: number;
  title: string;
  is_completed: boolean;
  task_id?: number;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  column_id: number;
  position: number;
  subtasks: Subtask[];
}

export interface Column {
  id: number;
  title: string;
  board_id: number;
  position: number;
  tasks: Task[];
}

export interface Board {
  id: number;
  title: string;
  user_id: number;
  columns: Column[];
}