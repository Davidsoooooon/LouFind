'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeftRight, Check, LogOut, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NativeSelect } from '@/components/ui/native-select';
import { Modal } from './common';
import { CampusShell } from './campus-shell';
import { AppLoading } from './app-loading';
import { HomeView } from '@/features/home';
import { BrowseView } from '@/features/browse';
import { ActivityView } from '@/features/activity';
import { MatchesView } from '@/features/matches';
import { NotificationsView } from '@/features/notifications';
import { SecurityView } from '@/features/security';
import { HelpView } from '@/features/help';
import { AuthView } from '@/features/auth';
import { ReportForm } from '@/features/report-form';
import { ItemDetails } from '@/features/item-details';
import { DemoProvider, useDemo } from '@/lib/demo-store';
import { findMatches } from '@/lib/services/matching';
import { saveReport } from '@/lib/services/workflows';
import { reportSchema } from '@/lib/schemas';
import type { ItemReport, Page, ReportInput, ReportType } from '@/lib/types';
interface InstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}
const PAGES: Page[] = [
  'home',
  'browse',
  'activity',
  'matches',
  'notifications',
  'security',
  'help',
];
export default function CampusApp() {
  return (
    <DemoProvider>
      <Workspace />
    </DemoProvider>
  );
}
function Workspace() {
  const { state, ready, error, transact, reset } = useDemo();
  const [introComplete, setIntroComplete] = useState(false);
  const [page, setPage] = useState<Page>('home'),
    [query, setQuery] = useState(''),
    [activityTab, setActivityTab] = useState('lost'),
    [selected, setSelected] = useState<string | null>(null),
    [report, setReport] = useState<{
      type: ReportType;
      initial?: ItemReport;
    } | null>(null),
    [account, setAccount] = useState(false),
    [toast, setToast] = useState(''),
    [install, setInstall] = useState<InstallPrompt | null>(null);
  const profile = state.profiles.find((p) => p.id === state.currentUserId);
  const matches = useMemo(() => findMatches(state.reports), [state.reports]);
  const mine = matches.filter(
    (m) =>
      state.reports.find((r) => r.id === m.lostReportId)?.reporterId ===
      profile?.id,
  );
  const unread = state.notifications.filter(
    (n) => n.userId === profile?.id && !n.read,
  ).length;
  useEffect(() => {
    // Keep the first paint legible without delaying later in-app navigation.
    const timer = window.setTimeout(() => setIntroComplete(true), 900);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    function sync() {
      const [p, search] = location.hash.slice(1).split('?');
      if (p === 'main-content') return;
      setPage(PAGES.includes(p as Page) ? (p as Page) : 'home');
      const params = new URLSearchParams(search);
      setSelected(params.get('item'));
      if (params.get('tab')) setActivityTab(params.get('tab')!);
    }
    sync();
    window.addEventListener('hashchange', sync);
    window.addEventListener('popstate', sync);
    return () => {
      window.removeEventListener('hashchange', sync);
      window.removeEventListener('popstate', sync);
    };
  }, []);
  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setInstall(event as InstallPrompt);
    };
    window.addEventListener('beforeinstallprompt', handler);
    if ('serviceWorker' in navigator && import.meta.env.PROD)
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 4500);
    return () => clearTimeout(timer);
  }, [toast]);
  function navigate(next: Page, tab?: string) {
    setSelected(null);
    setPage(next);
    if (tab) setActivityTab(tab);
    history.pushState(null, '', `#${next}${tab ? `?tab=${tab}` : ''}`);
    window.scrollTo({ top: 0, behavior: 'instant' });
    requestAnimationFrame(() =>
      document.getElementById('main-content')?.focus({ preventScroll: true }),
    );
  }
  function open(id: string) {
    setSelected(id);
    history.pushState(null, '', `#${page}?item=${encodeURIComponent(id)}`);
  }
  function closeItem() {
    setSelected(null);
    history.replaceState(null, '', `#${page}`);
  }
  function role(value: string) {
    const target = state.profiles.find(
      (p) =>
        p.id ===
        (value === 'security'
          ? 'security'
          : value === 'staff'
            ? 'staff'
            : 'jamie'),
    );
    if (!target) return;
    try {
      transact((s) => ({ ...s, currentUserId: target.id }));
      setAccount(false);
      setReport(null);
      navigate(value === 'security' ? 'security' : 'home');
      setToast(`You’re now viewing as ${target.name}.`);
    } catch (e) {
      setToast((e as Error).message);
    }
  }
  function save(id: string) {
    if (!profile) return;
    try {
      const existed = state.saved[profile.id]?.includes(id);
      transact((s) => ({
        ...s,
        saved: {
          ...s.saved,
          [profile.id]: existed
            ? (s.saved[profile.id] || []).filter((v) => v !== id)
            : [...(s.saved[profile.id] || []), id],
        },
      }));
      setToast(
        existed ? 'Item removed from saved items.' : 'Saved to My activity.',
      );
    } catch (e) {
      setToast((e as Error).message);
    }
  }
  const persistReport = useCallback(
    (data: ReportInput, id: string, draft: boolean) => {
      if (!profile) throw new Error('Please sign in.');
      const validated = draft ? data : reportSchema.parse(data);
      const existing = state.reports.find((r) => r.id === id);
      const reference =
        existing?.reference ||
        `FC-2026-${id.replaceAll('-', '').slice(0, 8).toUpperCase()}`;
      transact((s) =>
        saveReport(
          s,
          {
            ...validated,
            id,
            reference,
            reporterId: profile.id,
            status: draft ? 'Draft' : 'Reported',
            storageLocation: existing?.storageLocation || '',
            createdAt: existing?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          draft,
        ),
      );
      return reference;
    },
    [profile, state.reports, transact],
  );
  if (!ready || !introComplete) return <AppLoading />;
  if (!profile) return <AuthView />;
  const shared = {
    state,
    profile,
    matchCount: mine.length,
    onNavigate: navigate,
    onOpen: open,
    onSave: save,
    onReport: (type: ReportType) => setReport({ type }),
    onSearch: (value: string) => {
      setQuery(value);
      navigate('browse');
    },
  };
  return (
    <CampusShell
      page={page}
      activityTab={activityTab}
      profile={profile}
      unread={unread}
      matchCount={mine.length}
      onNavigate={navigate}
      onRole={role}
      onAccount={() => setAccount(true)}
      onReport={() => setReport({ type: 'lost' })}
    >
      {error && (
        <div className="error-note" role="alert">
          {error}
        </div>
      )}
      {page === 'home' && <HomeView {...shared} />}{' '}
      {page === 'browse' && (
        <BrowseView
          query={query}
          setQuery={setQuery}
          onOpen={open}
          onSave={save}
          onReport={() => setReport({ type: 'lost' })}
        />
      )}{' '}
      {page === 'activity' && (
        <ActivityView
          tab={activityTab}
          setTab={(tab) => navigate('activity', tab)}
          onOpen={open}
          onSave={save}
          onReport={() => setReport({ type: 'lost' })}
          onEdit={(r) => setReport({ type: r.type, initial: r })}
        />
      )}{' '}
      {page === 'matches' && <MatchesView onOpen={open} />}{' '}
      {page === 'notifications' && <NotificationsView onOpen={open} />}{' '}
      {page === 'security' && <SecurityView onOpen={open} />}{' '}
      {page === 'help' && (
        <HelpView
          onReport={() => setReport({ type: 'lost' })}
          onBrowse={() => navigate('browse')}
          installAvailable={!!install}
          onInstall={() => {
            void install?.prompt();
            setInstall(null);
          }}
        />
      )}
      {selected &&
        state.reports.some(
          (r) => r.id === selected && r.status !== 'Draft',
        ) && (
          <ItemDetails
            key={selected}
            id={selected}
            onClose={closeItem}
            onOpen={open}
            onSave={save}
            onEdit={(r) => {
              closeItem();
              setReport({ type: r.type, initial: r });
            }}
            onManage={() => navigate('security')}
          />
        )}
      {report && (
        <ReportForm
          key={report.initial?.id || 'new'}
          type={report.type}
          initial={report.initial}
          onClose={() => setReport(null)}
          onSave={persistReport}
        />
      )}
      {account && (
        <Modal
          title="Your campus account"
          description="This prototype stores sample data only on this device."
          onClose={() => setAccount(false)}
        >
          <div className="account-details">
            <span className="avatar">
              {profile.name
                .split(' ')
                .map((v) => v[0])
                .slice(0, 2)
                .join('')}
            </span>
            <h2>{profile.name}</h2>
            <p>{profile.email}</p>
            <small>{profile.schoolId}</small>
          </div>
          <div className="account-role">
            <label htmlFor="account-role">
              <ArrowLeftRight size={16} />
              Try another demo role
            </label>
            <NativeSelect
              id="account-role"
              value={profile.role}
              onChange={(e) => role(e.target.value)}
            >
              <option value="student">Student · Jamie Santos</option>
              <option value="staff">Staff · Alex Rivera</option>
              <option value="security">Security · Officer Cruz</option>
            </NativeSelect>
          </div>
          <p className="field-hint">
            Demo mode is for testing workflows, not real authentication. Never
            enter sensitive information or a password you use elsewhere.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setAccount(false);
              transact((s) => ({ ...s, currentUserId: null }));
              navigate('home');
            }}
          >
            <LogOut size={15} />
            Sign out / change account
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              if (
                window.confirm(
                  'Reset all demo reports, claims, photos, and accounts on this device?',
                )
              ) {
                reset();
                setAccount(false);
                navigate('home');
                setToast('Demo reset to the sample data.');
              }
            }}
          >
            <RotateCcw size={14} />
            Reset demo data
          </Button>
        </Modal>
      )}
      {toast && (
        <output className="app-toast" aria-live="polite">
          <Check size={17} />
          <span>{toast}</span>
          <button
            onClick={() => setToast('')}
            aria-label="Dismiss notification"
          >
            <X size={15} />
          </button>
        </output>
      )}
    </CampusShell>
  );
}
