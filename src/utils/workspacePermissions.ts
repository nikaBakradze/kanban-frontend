import type { Workspace } from '../types/workspace';

const hasWorkspaceManagementRole = (workspace: Workspace | null | undefined) =>
  workspace?.role === 'OWNER' || workspace?.role === 'ADMIN';

export const isOwner = (workspace: Workspace | null | undefined) => workspace?.role === 'OWNER';
export const isAdmin = (workspace: Workspace | null | undefined) => workspace?.role === 'ADMIN';
export const isMember = (workspace: Workspace | null | undefined) => workspace?.role === 'MEMBER';

export const canManageWorkspace = (workspace: Workspace | null | undefined) =>
  workspace?.type === 'PERSONAL' || hasWorkspaceManagementRole(workspace);

export const canManageBoard = canManageWorkspace;
export const canManageColumn = canManageWorkspace;
export const canDeleteTask = canManageWorkspace;

export const canManageMembers = (workspace: Workspace | null | undefined) =>
  workspace?.type !== 'PERSONAL' && hasWorkspaceManagementRole(workspace);

export const canManageInvites = canManageMembers;
export const canAssignTasks = (workspace: Workspace | null | undefined) =>
  workspace?.type !== 'PERSONAL' && hasWorkspaceManagementRole(workspace);

export const workspaceManagementPermissionMessage =
  'Only workspace owners and admins can perform this action.';
