import type { Board, Column, Subtask, Task } from './kanban';
import type { WorkspaceEmailInvitation, WorkspaceEmailInvitationStatus } from './workspace';

type BoardChange = {
  event: 'board.created' | 'board.updated';
  payload: Board;
};

type BoardDeleted = {
  event: 'board.deleted';
  payload: { board_id: number };
};

type ColumnCreated = {
  event: 'column.created';
  payload: Column;
};

type TaskChange = {
  event: 'task.created' | 'task.updated' | 'task.assignees.updated';
  payload: { board_id: number; task: Task };
};

type TaskDeleted = {
  event: 'task.deleted';
  payload: { board_id: number; task_id: number };
};

type SubtaskChanged = {
  event: 'subtask.updated';
  payload: { board_id: number; task_id: number; subtask: Subtask };
};

type WorkspaceChange = {
  event: 'member.joined' | 'member.removed' | 'member.role.updated' | 'invite.created' | 'invite.revoked';
  payload: { user_id?: number; member_id?: number; role?: string; expires_at?: string | null };
};

export type WorkspaceRealtimeEvent = (BoardChange | BoardDeleted | ColumnCreated | TaskChange | TaskDeleted | SubtaskChanged | WorkspaceChange) & {
  workspace_id: number;
  actor_id: number;
};

export type UserRealtimeEvent =
  | { event: 'workspace.invitation.created'; payload: WorkspaceEmailInvitation }
  | { event: 'workspace.invitation.updated'; payload: { invitation_id: number; status: WorkspaceEmailInvitationStatus } };
