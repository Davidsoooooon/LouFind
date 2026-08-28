'use client';
import { useState } from 'react';
import {
  ArrowLeftRight,
  ArrowUpRight,
  Bell,
  Bookmark,
  ChevronRight,
  CircleHelp,
  FileText,
  GraduationCap,
  House,
  MapPin,
  Menu,
  Plus,
  ScanSearch,
  Search,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import type { Page, Profile } from '@/lib/types';
import { CAMPUS } from '@/lib/campus';
import { LouFindLogo } from '@/components/loufind-logo';
import { Button } from '@/components/ui/button';
import { NativeSelect } from '@/components/ui/native-select';
import { Modal } from '@/components/common';

export const NAV = [
  { id: 'home', title: 'Home', icon: House },
  { id: 'browse', title: 'Browse items', icon: Search },
  { id: 'activity', title: 'My reports & claims', icon: FileText },
  { id: 'matches', title: 'Possible matches', icon: ScanSearch },
  { id: 'notifications', title: 'Notifications', icon: Bell },
] as const;

export function CampusShell({
  page,
  activityTab,
  profile,
  unread,
  matchCount,
  onNavigate,
  onRole,
  onAccount,
  onReport,
  children,
}: {
  page: Page;
  activityTab: string;
  profile: Profile;
  unread: number;
  matchCount: number;
  onNavigate: (page: Page, tab?: string) => void;
  onRole: (role: string) => void;
  onAccount: () => void;
  onReport: () => void;
  children: React.ReactNode;
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const initials = profile.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');
  const savedActive = page === 'activity' && activityTab === 'saved';
  const moreActive =
    ['matches', 'notifications', 'help', 'security'].includes(page) ||
    savedActive;
  const go = (next: Page, tab?: string) => {
    setMoreOpen(false);
    onNavigate(next, tab);
  };
  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main-content')?.focus();
        }}
      >
        Skip to content
      </a>
      <aside className="sidebar">
        <button
          className="brand"
          onClick={() => onNavigate('home')}
          aria-label="LouFind home"
        >
          <LouFindLogo />
          <span className="loufind-wordmark">
            Lou<span>Find</span>
            <small>SLU LOST & FOUND</small>
          </span>
        </button>
        <a
          className="sidebar-campus"
          href={CAMPUS.website}
          target="_blank"
          rel="noreferrer"
        >
          <span>
            {CAMPUS.name}
            <small>{CAMPUS.location}</small>
          </span>
          <ArrowUpRight size={14} />
        </a>
        <Button className="sidebar-report" onClick={onReport}>
          <Plus size={18} />
          Report an item
        </Button>
        <nav className="desktop-nav" aria-label="Main navigation">
          {NAV.map(({ id, title, icon: Icon }) => {
            const active = page === id && !savedActive;
            return (
              <button
                key={id}
                className={`nav-item ${active ? 'active' : ''}`}
                onClick={() =>
                  onNavigate(id, id === 'activity' ? 'lost' : undefined)
                }
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={20} strokeWidth={1.8} />
                <span>{title}</span>
                {id === 'matches' && matchCount > 0 && (
                  <span className="nav-count">{matchCount}</span>
                )}
                {id === 'notifications' && unread > 0 && (
                  <span className="nav-count">{unread}</span>
                )}
              </button>
            );
          })}
          <button
            className={`nav-item ${savedActive ? 'active' : ''}`}
            aria-current={savedActive ? 'page' : undefined}
            onClick={() => onNavigate('activity', 'saved')}
          >
            <Bookmark size={20} />
            <span>Saved items</span>
          </button>
          {profile.role === 'security' && (
            <button
              className={`nav-item ${page === 'security' ? 'active' : ''}`}
              aria-current={page === 'security' ? 'page' : undefined}
              onClick={() => onNavigate('security')}
            >
              <ShieldCheck size={20} />
              <span>Security dashboard</span>
            </button>
          )}
          <div className="nav-divider" />
          <button
            className={`nav-item ${page === 'help' ? 'active' : ''}`}
            aria-current={page === 'help' ? 'page' : undefined}
            onClick={() => onNavigate('help')}
          >
            <CircleHelp size={20} />
            <span>Help & how it works</span>
          </button>
        </nav>
        <div className="sidebar-bottom">
          <p className="prototype-label">
            Unofficial SLU Baguio prototype
            <br />
            <span>Sample data · saved on this device</span>
          </p>
          <div className="demo-switch">
            <label htmlFor="role-switch">
              <ArrowLeftRight size={15} />
              Try a demo role
            </label>
            <NativeSelect
              id="role-switch"
              aria-label="Switch demo role"
              value={profile.role}
              onChange={(e) => onRole(e.target.value)}
            >
              <option value="student">Student</option>
              <option value="staff">Staff</option>
              <option value="security">Campus security</option>
            </NativeSelect>
          </div>
          <button className="profile-button" onClick={onAccount}>
            <span className="avatar">{initials}</span>
            <span>
              <strong>{profile.name}</strong>
              <small>Demo account · Settings</small>
            </span>
            <ChevronRight size={16} />
          </button>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <House size={17} />
            <ChevronRight size={14} />
            <span>
              {savedActive
                ? 'Saved items'
                : page === 'security'
                  ? 'Security dashboard'
                  : page === 'help'
                    ? 'Help & how it works'
                    : NAV.find((n) => n.id === page)?.title}
            </span>
          </div>
          <button
            className="mobile-brand"
            onClick={() => onNavigate('home')}
            aria-label="LouFind home"
          >
            <LouFindLogo />
            <span>
              <strong>LouFind</strong>
              <small>{CAMPUS.shortName} · Philippines</small>
            </span>
          </button>
          <div className="topbar-right">
            <a
              className="campus-pill"
              href={CAMPUS.website}
              target="_blank"
              rel="noreferrer"
            >
              <GraduationCap size={18} />
              {CAMPUS.shortName} · Philippines
            </a>
            <Button
              variant="ghost"
              className="notification-button"
              aria-label={`Notifications, ${unread} unread`}
              onClick={() => onNavigate('notifications')}
            >
              <Bell size={20} />
              {unread > 0 && <span className="notification-dot" />}
            </Button>
            <button
              className="avatar avatar-small"
              aria-label="Open account"
              onClick={onAccount}
            >
              {initials}
            </button>
          </div>
        </header>
        <main id="main-content" className="main-content" tabIndex={-1}>
          {children}
        </main>
        <footer className="app-footer">
          <span>
            <MapPin size={15} />
            LouFind · Saint Louis University, Baguio
          </span>
          <span>Unofficial demo · Not connected to SLU services</span>
        </footer>
      </div>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        <button
          className={page === 'home' ? 'active' : ''}
          aria-current={page === 'home' ? 'page' : undefined}
          onClick={() => onNavigate('home')}
        >
          <House size={22} />
          <span>Home</span>
        </button>
        <button
          className={page === 'browse' ? 'active' : ''}
          aria-current={page === 'browse' ? 'page' : undefined}
          onClick={() => onNavigate('browse')}
        >
          <Search size={22} />
          <span>Browse</span>
        </button>
        <button
          className="mobile-report"
          onClick={onReport}
          aria-label="Report an item"
        >
          <Plus size={23} />
          <span>Report</span>
        </button>
        <button
          className={page === 'activity' && !savedActive ? 'active' : ''}
          aria-current={
            page === 'activity' && !savedActive ? 'page' : undefined
          }
          onClick={() => onNavigate('activity', 'lost')}
        >
          <FileText size={22} />
          <span>My reports</span>
        </button>
        <button
          className={moreActive ? 'active' : ''}
          onClick={() => setMoreOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={moreOpen}
        >
          <Menu size={22} />
          <span>More</span>
        </button>
      </nav>
      {moreOpen && (
        <Modal
          title="More options"
          description="Matches, updates, saved items, and help."
          onClose={() => setMoreOpen(false)}
        >
          <nav className="more-menu" aria-label="More navigation">
            <button onClick={() => go('matches')}>
              <ScanSearch size={21} />
              <span>Possible matches</span>
              {matchCount > 0 && (
                <span className="nav-count">{matchCount}</span>
              )}
              <ChevronRight size={17} />
            </button>
            <button onClick={() => go('notifications')}>
              <Bell size={21} />
              <span>Notifications</span>
              {unread > 0 && <span className="nav-count">{unread}</span>}
              <ChevronRight size={17} />
            </button>
            <button onClick={() => go('activity', 'claims')}>
              <ShieldCheck size={21} />
              <span>My claims</span>
              <ChevronRight size={17} />
            </button>
            <button onClick={() => go('activity', 'saved')}>
              <Bookmark size={21} />
              <span>Saved items</span>
              <ChevronRight size={17} />
            </button>
            <button onClick={() => go('help')}>
              <CircleHelp size={21} />
              <span>Help & how it works</span>
              <ChevronRight size={17} />
            </button>
            {profile.role === 'security' && (
              <button onClick={() => go('security')}>
                <ShieldCheck size={21} />
                <span>Security dashboard</span>
                <ChevronRight size={17} />
              </button>
            )}
            <button
              onClick={() => {
                setMoreOpen(false);
                onAccount();
              }}
            >
              <UserRound size={21} />
              <span>Account & demo roles</span>
              <ChevronRight size={17} />
            </button>
          </nav>
        </Modal>
      )}
    </div>
  );
}
