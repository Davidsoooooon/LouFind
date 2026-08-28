'use client';
import {
  Bell,
  CheckCheck,
  ChevronRight,
  HeartHandshake,
  ScanSearch,
  ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import { EmptyState, ViewHeader } from '@/components/common';
import { Button } from '@/components/ui/button';
import { useDemo } from '@/lib/demo-store';
import { formatDate } from '@/lib/seed';
export function NotificationsView({
  onOpen,
}: {
  onOpen: (id: string) => void;
}) {
  const { state, transact } = useDemo();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const notices = state.notifications
    .filter((n) => n.userId === state.currentUserId && (!unreadOnly || !n.read))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <>
      <ViewHeader
        title="A little update."
        description="Matches, claim reviews, and good news from campus."
      >
        <Button
          variant="outline"
          onClick={() =>
            transact((s) => ({
              ...s,
              notifications: s.notifications.map((n) =>
                n.userId === s.currentUserId ? { ...n, read: true } : n,
              ),
            }))
          }
        >
          <CheckCheck size={16} />
          Mark all as read
        </Button>
      </ViewHeader>
      <div className="tabs activity-tabs">
        <button
          className={!unreadOnly ? 'active' : ''}
          onClick={() => setUnreadOnly(false)}
        >
          All updates
        </button>
        <button
          className={unreadOnly ? 'active' : ''}
          onClick={() => setUnreadOnly(true)}
        >
          Unread
        </button>
      </div>
      {notices.length ? (
        <div className="notifications-list">
          {notices.map((n) => {
            const Icon =
              n.type === 'match'
                ? ScanSearch
                : n.type === 'returned'
                  ? HeartHandshake
                  : n.type === 'pickup'
                    ? ShieldCheck
                    : Bell;
            return (
              <button
                key={n.id}
                className={`notice ${!n.read ? 'unread' : ''}`}
                onClick={() => {
                  transact((s) => ({
                    ...s,
                    notifications: s.notifications.map((v) =>
                      v.id === n.id ? { ...v, read: true } : v,
                    ),
                  }));
                  onOpen(n.reportId);
                }}
              >
                <Icon size={23} strokeWidth={1.4} />
                <span>
                  <strong>
                    {n.title}
                    {!n.read && <i />}
                  </strong>
                  <p>{n.message}</p>
                  <small>{formatDate(n.createdAt)}</small>
                </span>
                <ChevronRight size={17} />
              </button>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="You’re all caught up"
          description="Your next update will appear here. We’ll let you know when something changes."
        />
      )}
    </>
  );
}
