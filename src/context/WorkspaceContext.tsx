/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { createWorkspace as createWorkspaceRequest, getWorkspaces } from '../api/workspaceApi';
import { useAuth } from './AuthContext';
import type { Workspace, WorkspaceType } from '../types/workspace';

interface WorkspaceContextValue {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  loading: boolean;
  selectWorkspace: (id: number) => void;
  createWorkspace: (name: string, type: Exclude<WorkspaceType, 'PERSONAL'>) => Promise<Workspace>;
  refreshWorkspaces: (preferredId?: number) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshWorkspaces = useCallback(async (preferredId?: number) => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getWorkspaces();
      setWorkspaces(data);
      const storedId = Number(localStorage.getItem('activeWorkspaceId'));
      const selected = data.find((item) => item.id === preferredId)
        ?? data.find((item) => item.id === storedId)
        ?? data[0]
        ?? null;
      setActiveWorkspace(selected);
      if (selected) localStorage.setItem('activeWorkspaceId', String(selected.id));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (user) void refreshWorkspaces();
    else {
      setWorkspaces([]);
      setActiveWorkspace(null);
      localStorage.removeItem('activeWorkspaceId');
    }
  }, [authLoading, refreshWorkspaces, user]);

  const selectWorkspace = useCallback((id: number) => {
    const selected = workspaces.find((item) => item.id === id);
    if (selected) {
      setActiveWorkspace(selected);
      localStorage.setItem('activeWorkspaceId', String(id));
    }
  }, [workspaces]);

  const createWorkspace = useCallback(async (name: string, type: Exclude<WorkspaceType, 'PERSONAL'>) => {
    const workspace = await createWorkspaceRequest(name, type);
    setWorkspaces((current) => [...current, workspace]);
    setActiveWorkspace(workspace);
    localStorage.setItem('activeWorkspaceId', String(workspace.id));
    return workspace;
  }, []);

  return (
    <WorkspaceContext.Provider value={{ workspaces, activeWorkspace, loading, selectWorkspace, createWorkspace, refreshWorkspaces }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used within a WorkspaceProvider');
  return context;
};
