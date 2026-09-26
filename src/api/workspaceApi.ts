import API from './axios';
import type { InviteResponse, InviteValidation, Workspace, WorkspaceMember, WorkspaceType } from '../types/workspace';

export const getWorkspaces = async (): Promise<Workspace[]> => {
  const { data } = await API.get<Workspace[]>('/api/workspaces');
  return data;
};

export const createWorkspace = async (name: string, type: Exclude<WorkspaceType, 'PERSONAL'>): Promise<Workspace> => {
  const { data } = await API.post<Workspace>('/api/workspaces', { name, type });
  return data;
};

export const getWorkspace = async (id: number): Promise<Workspace & { members: Array<{ id: number; user_id: number; role: WorkspaceMember['role']; created_at: string }> }> => {
  const { data } = await API.get(`/api/workspaces/${id}`);
  return data;
};

export const getMembers = async (id: number): Promise<WorkspaceMember[]> => {
  const { data } = await API.get<WorkspaceMember[]>(`/api/workspaces/${id}/members`);
  return data;
};

export const createInvite = async (id: number, expires_in_days?: number | 'never'): Promise<InviteResponse> => {
  const { data } = await API.post<InviteResponse>(`/api/workspaces/${id}/invites`, { expires_in_days: expires_in_days ?? 'never' });
  return data;
};

export const revokeInvite = async (token: string): Promise<void> => {
  await API.delete(`/api/workspaces/invites/${token}`);
};

export const validateInvite = async (token: string): Promise<InviteValidation> => {
  const { data } = await API.get<InviteValidation>(`/api/workspaces/invites/${token}`);
  return data;
};

export const acceptInvite = async (token: string): Promise<{ workspace_id: number; role: WorkspaceMember['role'] }> => {
  const { data } = await API.post(`/api/workspaces/invites/${token}/accept`);
  return { workspace_id: Number(data.workspace_id), role: data.role };
};

export const removeMember = async (workspaceId: number, memberId: number): Promise<void> => {
  await API.delete(`/api/workspaces/${workspaceId}/members/${memberId}`);
};
