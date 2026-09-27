import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { acceptInvite, validateInvite } from '../api/workspaceApi';
import type { InviteValidation } from '../types/workspace';

export default function InvitePage() {
  const { token = '' } = useParams();
  const { user, loading: authLoading } = useAuth();
  const { refreshWorkspaces } = useWorkspace();
  const location = useLocation();
  const navigate = useNavigate();
  const [invite, setInvite] = useState<InviteValidation | null>(null);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login', { replace: true, state: { from: `${location.pathname}${location.search}` } });
      return;
    }
    void validateInvite(token).then(setInvite).catch((reason: unknown) => {
      setError(axios.isAxiosError(reason) ? reason.response?.data?.message || 'This invite is invalid or expired.' : 'This invite is invalid or expired.');
    });
  }, [authLoading, location.pathname, location.search, navigate, token, user]);

  if (!user) return null;
  if (error) return <div className="rounded-lg bg-white p-8 text-center text-[#EA5555]">{error}</div>;
  if (!invite) return <div className="text-white">Loading invite...</div>;

  const join = async () => {
    setJoining(true);
    try {
      const result = await acceptInvite(token);
      await refreshWorkspaces(result.workspace_id);
      navigate('/dashboard', { replace: true });
    } catch (reason: unknown) {
      setError(axios.isAxiosError(reason) ? reason.response?.data?.message || 'Unable to join workspace.' : 'Unable to join workspace.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="rounded-lg bg-white p-8 text-center dark:bg-[#2B2C37]">
      <h1 className="mb-4 text-xl font-bold text-[#000112] dark:text-white">You&apos;ve been invited to {invite.workspace.name}</h1>
      <button type="button" onClick={join} disabled={joining} className="rounded-full bg-[#635FC7] px-6 py-3 font-bold text-white disabled:opacity-50">
        {joining ? 'Joining...' : 'Join Workspace'}
      </button>
    </div>
  );
}
