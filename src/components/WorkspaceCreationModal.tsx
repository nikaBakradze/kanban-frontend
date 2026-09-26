import { useState, type FormEvent } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { useNavigate } from 'react-router-dom';

export function WorkspaceCreationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { createWorkspace } = useWorkspace();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [type, setType] = useState<'TEAM' | 'EDUCATION'>('TEAM');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await createWorkspace(name.trim(), type);
      setName('');
      onClose();
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={(event) => event.stopPropagation()} className="w-full max-w-md space-y-5 rounded-lg bg-white p-6 dark:bg-[#2B2C37]">
        <h2 className="text-lg font-bold text-[#000112] dark:text-white">Create Workspace</h2>
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Workspace name" required className="w-full rounded border border-[#828FA3]/25 bg-transparent px-4 py-2 text-sm dark:text-white" />
        <select value={type} onChange={(event) => setType(event.target.value as 'TEAM' | 'EDUCATION')} className="w-full rounded border border-[#828FA3]/25 bg-white px-4 py-2 text-sm dark:bg-[#2B2C37] dark:text-white">
          <option value="TEAM">Team</option>
          <option value="EDUCATION">Education</option>
        </select>
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="flex-1 rounded-full bg-[#635FC7] py-2 font-bold text-white disabled:opacity-50">{loading ? 'Creating...' : 'Create Workspace'}</button>
          <button type="button" onClick={onClose} className="rounded-full bg-gray-100 px-4 py-2 font-bold text-[#828FA3] dark:bg-gray-700">Cancel</button>
        </div>
      </form>
    </div>
  );
}
