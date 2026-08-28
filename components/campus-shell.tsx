'use client';
import {
  ArrowLeftRight,
  ArrowUpRight,
  Bell,
  Bookmark,
  ChevronRight,
  CircleHelp,
  GraduationCap,
  House,
  Layers,
  MapPin,
  ScanSearch,
  Search,
  ShieldCheck,
} from 'lucide-react';
import type { Page, Profile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { NativeSelect } from '@/components/ui/native-select';
export const NAV = [
  { id: 'home', title: 'Overview', icon: House },
  { id: 'browse', title: 'Browse items', icon: Search },
  { id: 'activity', title: 'My activity', icon: Layers },
  { id: 'matches', title: 'Possible matches', icon: ScanSearch },
  { id: 'notifications', title: 'Notifications', icon: Bell },
] as const;
export function CampusShell({
  page,
  profile,
  unread,
  matchCount,
  onNavigate,
  onRole,
  onAccount,
  children,
}: {
  page: Page;
  profile: Profile;
  unread: number;
  matchCount: number;
  onNavigate: (page: Page, tab?: string) => void;
  onRole: (role: string) => void;
  onAccount: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <aside className="sidebar">
        <button
          className="brand"
          onClick={() => onNavigate('home')}
          aria-label="FindIt Campus home"
        >
          <span className="brand-mark">
            <MapPin size={27} strokeWidth={1.8} />
            <span />
          </span>
          <span>
            FindIt<span className="brand-campus">CAMPUS</span>
          </span>
        </button>
        <div className="sidebar-label">A PLACE FOR WHAT’S MISPLACED</div>
        <nav className="desktop-nav" aria-label="Main navigation">
          {NAV.map(({ id, title, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item ${page === id ? 'active' : ''}`}
              onClick={() => onNavigate(id)}
              aria-current={page === id ? 'page' : undefined}
            >
              <Icon size={19} strokeWidth={1.7} />
              <span>{title}</span>
              {id === 'matches' && matchCount > 0 && (
                <span className="nav-count teal">{matchCount}</span>
              )}
              {id === 'notifications' && unread > 0 && (
                <span className="nav-count">{unread}</span>
              )}
            </button>
          ))}
          <div className="nav-divider" />
          <button
            className="nav-item"
            onClick={() => onNavigate('activity', 'saved')}
          >
            <Bookmark size={19} strokeWidth={1.7} />
            <span>Saved items</span>
          </button>
          {profile.role === 'security' && (
            <button
              className={`nav-item ${page === 'security' ? 'active' : ''}`}
              onClick={() => onNavigate('security')}
            >
              <ShieldCheck size={19} />
              <span>Security dashboard</span>
            </button>
          )}
        </nav>
        <div className="sidebar-bottom">
          <div className="campus-note">
            <ShieldCheck size={23} strokeWidth={1.5} />
            <h3>In safe hands.</h3>
            <p>Every claim is checked by campus security before pickup.</p>
            <button onClick={() => onNavigate('help')}>
              How it works <ArrowUpRight size={14} />
            </button>
          </div>
          <button
            className="nav-item help-link"
            onClick={() => onNavigate('help')}
          >
            <CircleHelp size={18} />
            <span>Help & campus support</span>
          </button>
          <div className="demo-switch">
            <label htmlFor="role-switch">
              <ArrowLeftRight size={14} /> DEMO VIEW
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
            <span className="avatar">
              {profile.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </span>
            <span>
              <strong>{profile.name}</strong>
              <small>
                {profile.role === 'security'
                  ? 'Campus security'
                  : profile.role === 'staff'
                    ? 'Faculty & staff'
                    : 'Student'}{' '}
                <span>· Demo account</span>
              </small>
            </span>
            <ChevronRight size={16} />
          </button>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <House size={15} />
            <ChevronRight size={13} />
            <span>
              {page === 'security'
                ? 'Security dashboard'
                : page === 'help'
                  ? 'Help & support'
                  : NAV.find((n) => n.id === page)?.title}
            </span>
          </div>
          <div className="mobile-brand">
            <MapPin size={22} />
            <strong>
              FindIt <span>Campus</span>
            </strong>
          </div>
          <div className="topbar-right">
            <span className="campus-pill">
              <span className="live-dot" />
              <GraduationCap size={15} />
              Westbridge University
            </span>
            <span className="topbar-rule" />
            <Button
              variant="ghost"
              className="notification-button"
              aria-label={`Notifications, ${unread} unread`}
              onClick={() => onNavigate('notifications')}
            >
              <Bell size={19} />
              {unread > 0 && <span className="notification-dot" />}
            </Button>
            <button
              className="avatar avatar-small"
              aria-label="Open account"
              onClick={onAccount}
            >
              {profile.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </button>
          </div>
        </header>
        <main id="main-content" className="main-content">
          {children}
        </main>
        <footer className="app-footer">
          <span>
            <MapPin size={13} /> A little help. A happy reunion.
          </span>
          <span>
            Made for our campus community <span className="footer-dot">·</span>{' '}
            Local demo
          </span>
        </footer>
      </div>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {NAV.slice(0, 4).map(({ id, icon: Icon }) => (
          <button
            key={id}
            className={page === id ? 'active' : ''}
            onClick={() => onNavigate(id)}
            aria-current={page === id ? 'page' : undefined}
          >
            <Icon size={21} />
            <span>
              {id === 'home'
                ? 'Home'
                : id === 'browse'
                  ? 'Browse'
                  : id === 'activity'
                    ? 'Activity'
                    : 'Matches'}
            </span>
          </button>
        ))}
        {profile.role === 'security' ? (
          <button
            className={page === 'security' ? 'active' : ''}
            onClick={() => onNavigate('security')}
          >
            <ShieldCheck size={21} />
            <span>Security</span>
          </button>
        ) : (
          <button onClick={() => onNavigate('help')}>
            <CircleHelp size={21} />
            <span>Help</span>
          </button>
        )}
      </nav>
    </div>
  );
}
