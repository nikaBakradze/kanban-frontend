import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getPendingEmailInvitations, respondToEmailInvitation } from '../api/workspaceApi';
import { useKanban } from '../context/KanbanContext';
import { useWorkspace } from '../context/WorkspaceContext';
import type { UserRealtimeEvent } from '../types/realtime';
import type { WorkspaceEmailInvitation } from '../types/workspace';

export function WorkspaceInvitationNotifications() {
  const { subscribeSocketReconnect, subscribeUserEvents } = useKanban();
  const { refreshWorkspaces } = useWorkspace();
  const { t } = useTranslation();
  const [invitations, setInvitations] = useState<WorkspaceEmailInvitation[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [respondingId, setRespondingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const resolvedInvitationIds = useRef(new Set<number>());

  useEffect(() => {
    let mounted = true;
    const loadPendingInvitations = () => {
      void getPendingEmailInvitations()
        .then((data) => {
          if (mounted) {
            setInvitations((current) => {
              const existing = new Map(current.map((item) => [item.id, item]));
              for (const invitation of data) {
                if (!resolvedInvitationIds.current.has(invitation.id)) existing.set(invitation.id, invitation);
              }
              return [...existing.values()].sort((left, right) =>
                new Date(right.created_at).getTime() - new Date(left.created_at).getTime());
            });
          }
        })
        .catch((reason: unknown) => {
          console.error('Failed to load workspace invitations:', reason);
          if (mounted) setError(t('invitations.loadFailed'));
        })
        .finally(() => {
          if (mounted) setLoading(false);
        });
    };
    const unsubscribe = subscribeUserEvents((event: UserRealtimeEvent) => {
      if (event.event === 'workspace.invitation.created') {
        setInvitations((current) => current.some((item) => item.id === event.payload.id)
          ? current
          : [event.payload, ...current]);
      } else {
        resolvedInvitationIds.current.add(event.payload.invitation_id);
        setInvitations((current) => current.filter((item) => item.id !== event.payload.invitation_id));
      }
    });
    const unsubscribeFromReconnect = subscribeSocketReconnect(loadPendingInvitations);

    loadPendingInvitations();

    return () => {
      mounted = false;
      unsubscribe();
      unsubscribeFromReconnect();
    };
  }, [subscribeSocketReconnect, subscribeUserEvents, t]);

  const respond = async (invitation: WorkspaceEmailInvitation, action: 'accept' | 'decline') => {
    setError('');
    setRespondingId(invitation.id);
    try {
      const result = await respondToEmailInvitation(invitation.id, action);
      resolvedInvitationIds.current.add(invitation.id);
      setInvitations((current) => current.filter((item) => item.id !== invitation.id));
      if (action === 'accept') await refreshWorkspaces(result.workspace_id);
    } catch (reason: unknown) {
      console.error('Failed to respond to workspace invitation:', reason);
      setError(t('invitations.responseFailed'));
    } finally {
      setRespondingId(null);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={t('invitations.title')}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="relative rounded-full p-2 text-[#828FA3] transition-colors hover:bg-gray-100 hover:text-[#635FC7] dark:hover:bg-[#20212C]"
      >
        <Bell size={20} />
        {invitations.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#EA5555] px-1 text-[10px] font-bold text-white">
            {invitations.length}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-80 max-w-[calc(100vw-2rem)] space-y-3 rounded-xl border border-gray-100 bg-white p-4 shadow-xl dark:border-gray-800 dark:bg-[#20212C]">
          <h2 className="font-bold text-[#000112] dark:text-white">{t('invitations.title')}</h2>
          {loading && <p className="text-sm text-[#828FA3]">{t('invitations.loading')}</p>}
          {!loading && invitations.length === 0 && (
            <p className="text-sm text-[#828FA3]">{t('invitations.empty')}</p>
          )}
          {invitations.map((invitation) => (
            <div key={invitation.id} className="space-y-3 border-t border-[#828FA3]/20 pt-3">
              <p className="text-sm text-[#828FA3]">
                {t('invitations.message', {
                  inviter: invitation.inviter_name,
                  workspace: invitation.workspace_name,
                })}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void respond(invitation, 'accept')}
                  disabled={respondingId !== null}
                  className="flex-1 rounded-full bg-[#635FC7] px-3 py-2 text-sm font-bold text-white hover:bg-[#A8A4FF] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {respondingId === invitation.id ? t('invitations.working') : t('invitations.accept')}
                </button>
                <button
                  type="button"
                  onClick={() => void respond(invitation, 'decline')}
                  disabled={respondingId !== null}
                  className="flex-1 rounded-full bg-gray-100 px-3 py-2 text-sm font-bold text-[#828FA3] hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700"
                >
                  {t('invitations.decline')}
                </button>
              </div>
            </div>
          ))}
          {error && <p role="alert" className="text-sm text-[#EA5555]">{error}</p>}
        </div>
      )}
    </div>
  );
}
