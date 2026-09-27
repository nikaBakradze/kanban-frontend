
export type WorkspaceType = 'PERSONAL' | 'TEAM' | 'EDUCATION';
export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface Workspace {
  id: number;
  name: string;
  type: WorkspaceType;
  owner_id: number;
  created_at: string;
  role: WorkspaceRole;
}

export interface WorkspaceMember {
  id?: number;
  user_id: number;
  full_name: string;
  email: string;
  avatar_url?: string | null;
  role: WorkspaceRole;
  created_at: string;
}

export interface InviteValidation {
  valid: true;
  workspace: Pick<Workspace, 'id' | 'name' | 'type'>;
}

export interface InviteResponse {
  token: string;
  invite_url: string;
  expires_at: string | null;
}

export interface WorkspaceEmailInvitation {
  id: number;
  workspace_id: number;
  workspace_name: string;
  inviter_name: string;
  created_at: string;
}

export type WorkspaceEmailInvitationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';
