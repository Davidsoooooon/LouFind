'use client';
import { Plus, Pencil, ArrowRight, Trash2 } from 'lucide-react';
import { EmptyState, ViewHeader } from '@/components/common';
import { ItemCard, StatusBadge } from '@/components/item-card';
import { Button } from '@/components/ui/button';
import { useDemo } from '@/lib/demo-store';
import { formatDate } from '@/lib/seed';
import type { ItemReport } from '@/lib/types';
const TABS = [
  ['lost', 'My lost reports'],
  ['found', 'My found reports'],
  ['claims', 'My claims'],
  ['saved', 'Saved items'],
  ['drafts', 'Draft reports'],
];
export function ActivityView({
  tab,
  setTab,
  onOpen,
  onSave,
  onReport,
  onEdit,
}: {
  tab: string;
  setTab: (tab: string) => void;
  onOpen: (id: string) => void;
  onSave: (id: string) => void;
  onReport: () => void;
  onEdit: (report: ItemReport) => void;
}) {
  const { state, transact } = useDemo();
  const user = state.currentUserId!;
  const items = state.reports.filter((r) =>
    tab === 'saved'
      ? state.saved[user]?.includes(r.id)
      : r.reporterId === user &&
        (tab === 'drafts'
          ? r.status === 'Draft'
          : r.type === tab && r.status !== 'Draft'),
  );
  const claims = state.claims.filter((c) => c.claimantId === user);
  return (
    <>
      <ViewHeader
        title="My reports & claims"
        description="Track your reports, check claims, and continue saved drafts."
      >
        <Button onClick={onReport}>
          <Plus size={16} />
          New report
        </Button>
      </ViewHeader>
      <div className="tabs activity-tabs">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            aria-pressed={tab === id}
            className={tab === id ? 'active' : ''}
            onClick={() => setTab(id)}
          >
            {label}
            {id === 'claims' && claims.length > 0 && (
              <span>{claims.length}</span>
            )}
          </button>
        ))}
      </div>
      {tab === 'claims' ? (
        claims.length ? (
          <div className="claim-list">
            {claims.map((c) => {
              const item = state.reports.find((r) => r.id === c.reportId);
              return (
                <article className="claim-card" key={c.id}>
                  <div className="section-heading">
                    <div>
                      <span className="eyebrow">
                        CLAIM · {formatDate(c.createdAt)}
                      </span>
                      <h2>{item?.title}</h2>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                  <p>
                    {c.status === 'Under Review'
                      ? 'Campus security is checking your ownership details. We’ll notify you when your claim has been reviewed.'
                      : c.status === 'Ready for Pickup'
                        ? 'Your claim is approved. Bring your school ID to the Security Office, Main Entrance, 8 AM–5 PM weekdays.'
                        : c.status === 'Returned'
                          ? 'Safely back with you. Thanks for helping us close the loop.'
                          : 'Security could not verify this claim. Review the note below before submitting new evidence.'}
                  </p>
                  {c.reviewNote && (
                    <div className="review-note">
                      <strong>Security note</strong>
                      <p>{c.reviewNote}</p>
                    </div>
                  )}
                  <Button variant="outline" onClick={() => onOpen(c.reportId)}>
                    View item & claim <ArrowRight size={14} />
                  </Button>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No claims yet"
            description="When a found item looks like yours, open it and select “This might be mine.”"
          />
        )
      ) : items.length ? (
        <div className="item-grid browse-grid">
          {items.map((item) =>
            tab === 'drafts' ? (
              <article className="draft-card" key={item.id}>
                <Pencil size={24} />
                <StatusBadge status="Draft" />
                <h3>{item.title || 'Untitled report'}</h3>
                <p>
                  {item.type === 'lost' ? 'Lost' : 'Found'} item · Saved{' '}
                  {formatDate(item.updatedAt)}
                </p>
                <div>
                  <Button onClick={() => onEdit(item)}>
                    Continue report
                    <ArrowRight size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    aria-label={`Delete draft ${item.title}`}
                    onClick={() => {
                      if (
                        window.confirm(
                          'Delete this draft? This cannot be undone.',
                        )
                      )
                        transact((s) => ({
                          ...s,
                          reports: s.reports.filter((r) => r.id !== item.id),
                        }));
                    }}
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
              </article>
            ) : (
              <ItemCard
                key={item.id}
                item={item}
                onOpen={onOpen}
                onSave={onSave}
                saved={state.saved[user]?.includes(item.id)}
              />
            ),
          )}
        </div>
      ) : (
        <EmptyState
          title={
            tab === 'drafts'
              ? 'No unfinished reports'
              : tab === 'saved'
                ? 'A place for familiar finds'
                : 'No reports here yet'
          }
          description={
            tab === 'drafts'
              ? 'Your report is saved as you type. You can pick up where you left off here.'
              : tab === 'saved'
                ? 'Tap the bookmark on any item to keep it here.'
                : 'Report an item and track every update here.'
          }
        >
          <Button variant="outline" onClick={onReport}>
            Create a report
          </Button>
        </EmptyState>
      )}
    </>
  );
}
