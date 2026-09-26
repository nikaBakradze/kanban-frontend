import { useEffect, useState } from 'react';
import axios from 'axios';
import { createInvite, getMembers, getWorkspace, removeMember } from '../api/workspaceApi';
import { useWorkspace } from '../context/WorkspaceContext';
import type { WorkspaceMember } from '../types/workspace';

export function WorkspaceMembers({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { activeWorkspace } = useWorkspace();
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [inviteUrl, setInviteUrl] = useState('');
  const [error, setError] = useState('');
  const canManage = activeWorkspace?.role === 'OWNER' || activeWorkspace?.role === 'ADMIN';

  useEffect(() => {
    if (isOpen && activeWorkspace && activeWorkspace.type !== 'PERSONAL') {
      void Promise.all([getMembers(activeWorkspace.id), getWorkspace(activeWorkspace.id)]).then(([details, workspace]) => {
        setMembers(details.map((member) => ({
          ...member,
          id: workspace.members.find((item) => item.user_id === member.user_id)?.id,
        })));
      });
    }
  }, [activeWorkspace, isOpen]);

  if (!isOpen || !activeWorkspace || activeWorkspace.type === 'PERSONAL') return null;
  const invite = async () => {
    try {
      const result = await createInvite(activeWorkspace.id);
      setInviteUrl(`${window.location.origin}${result.invite_url}`);
    } catch (reason: unknown) {
      setError(axios.isAxiosError(reason) ? reason.response?.data?.message || 'Unable to create invite.' : 'Unable to create invite.');
    }
  };
  const remove = async (member: WorkspaceMember) => {
    if (!member.id) return;
    await removeMember(activeWorkspace.id, member.id);
    setMembers((current) => current.filter((item) => item.id !== member.id));
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div onClick={(event) => event.stopPropagation()} className="w-full max-w-md space-y-5 rounded-lg bg-white p-6 dark:bg-[#2B2C37]">
        <h2 className="text-lg font-bold text-[#000112] dark:text-white">{activeWorkspace.name} members</h2>
        <div className="space-y-2">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between text-sm text-[#000112] dark:text-white">
              <span>{member.full_name || member.email} <span className="text-[#828FA3]">({member.role})</span></span>
              {canManage && member.role !== 'OWNER' && member.id && <button type="button" onClick={() => void remove(member)} className="text-[#EA5555]">Remove</button>}
            </div>
          ))}
        </div>
        {canManage && <button type="button" onClick={() => void invite()} className="w-full rounded-full bg-[#635FC7] py-2 font-bold text-white">Create invite link</button>}
        {inviteUrl && <input readOnly value={inviteUrl} onFocus={(event) => event.currentTarget.select()} className="w-full rounded border px-3 py-2 text-xs" />}
        {error && <p className="text-sm text-[#EA5555]">{error}</p>}
        <button type="button" onClick={onClose} className="rounded-full bg-gray-100 px-4 py-2 font-bold text-[#828FA3] dark:bg-gray-700">Close</button>
      </div>
    </div>
  );
}
