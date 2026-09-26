import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkspaceCreationModal } from '../components/WorkspaceCreationModal';

export default function Onboarding() {
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  return (
    <>
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center dark:bg-[#2B2C37]">
        <h1 className="mb-2 text-2xl font-bold text-[#000112] dark:text-white">Choose your workspace</h1>
        <p className="mb-6 text-sm text-[#828FA3]">You can create more workspaces at any time.</p>
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/dashboard')} className="flex-1 rounded-full bg-[#635FC7] py-3 font-bold text-white">Personal</button>
          <button type="button" onClick={() => setCreateOpen(true)} className="flex-1 rounded-full bg-[#635FC7]/10 py-3 font-bold text-[#635FC7]">Create Team Workspace</button>
        </div>
      </div>
      <WorkspaceCreationModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}
