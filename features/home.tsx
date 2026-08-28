'use client';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  HeartHandshake,
  MapPin,
  Plus,
  ScanSearch,
  Search,
  SearchX,
  ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ItemCard, ItemPhoto, StatusBadge } from '@/components/item-card';
import type { DemoState, Page, Profile, ReportType } from '@/lib/types';
import { formatDate, locationName } from '@/lib/seed';
export function HomeView({
  state,
  profile,
  matchCount,
  onNavigate,
  onReport,
  onOpen,
  onSearch,
  onSave,
}: {
  state: DemoState;
  profile: Profile;
  matchCount: number;
  onNavigate: (page: Page, tab?: string) => void;
  onReport: (type: ReportType) => void;
  onOpen: (id: string) => void;
  onSearch: (query: string) => void;
  onSave: (id: string) => void;
}) {
  const [query, setQuery] = useState('');
  const mine = state.reports.filter(
    (r) => r.reporterId === profile.id && r.status !== 'Draft',
  );
  const recent = state.reports
    .filter(
      (r) =>
        r.type === 'found' &&
        !['Returned', 'Draft', 'Unclaimed'].includes(r.status),
    )
    .slice(0, 4);
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">YOUR CAMPUS LOST & FOUND</div>
          <h1>
            Good morning, {profile.name.split(' ')[0]}
            <span className="greeting-dot">.</span>
          </h1>
          <p>Let’s get your things back where they belong.</p>
        </div>
        <span className="date-label">
          <CalendarDays size={15} /> Friday, August 28
        </span>
      </div>
      <form
        className="home-search"
        onSubmit={(e) => {
          e.preventDefault();
          onSearch(query);
        }}
      >
        <Search size={21} strokeWidth={1.7} />
        <input
          aria-label="Search lost and found items"
          placeholder="What are you looking for? Try “black calculator”"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span className="search-hint">Search campus items</span>
        <Button type="submit">
          Search <ArrowRight size={15} />
        </Button>
      </form>
      <div className="report-actions">
        <button
          className="report-action lost-action"
          onClick={() => onReport('lost')}
        >
          <SearchX size={34} strokeWidth={1.3} />
          <div>
            <h2>Lost something?</h2>
            <p>Let your campus help you find it.</p>
            <span>
              Report a lost item <ArrowRight size={15} />
            </span>
          </div>
          <span className="action-corner">
            <Plus size={20} />
          </span>
        </button>
        <button
          className="report-action found-action"
          onClick={() => onReport('found')}
        >
          <HeartHandshake size={35} strokeWidth={1.3} />
          <div>
            <h2>Found something?</h2>
            <p>A small gesture. A big relief for someone.</p>
            <span>
              Report a found item <ArrowRight size={15} />
            </span>
          </div>
          <span className="action-corner">
            <Plus size={20} />
          </span>
        </button>
      </div>
      {matchCount > 0 && (
        <button className="match-banner" onClick={() => onNavigate('matches')}>
          <div className="match-symbol">
            <ScanSearch size={25} strokeWidth={1.6} />
          </div>
          <div>
            <h3>
              A familiar find?{' '}
              <span>
                {matchCount} possible {matchCount === 1 ? 'match' : 'matches'}
              </span>
            </h3>
            <p>Some recently found items look like the ones you reported.</p>
          </div>
          <span className="match-banner-link">
            Take a look <ArrowRight size={16} />
          </span>
        </button>
      )}
      <section className="recent-section">
        <div className="section-heading">
          <div>
            <h2>
              Fresh finds around campus <span className="small-dot" />
            </h2>
            <p>Recognize something? It could be waiting for you.</p>
          </div>
          <button className="text-link" onClick={() => onNavigate('browse')}>
            Browse all items <ArrowRight size={15} />
          </button>
        </div>
        <div className="item-grid">
          {recent.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              saved={state.saved[profile.id]?.includes(item.id)}
              onOpen={onOpen}
              onSave={onSave}
            />
          ))}
        </div>
      </section>
      <div className="home-lower">
        <section className="my-reports">
          <div className="section-heading">
            <h2>Your recent activity</h2>
            <button
              className="text-link"
              onClick={() => onNavigate('activity')}
            >
              View all <ArrowRight size={14} />
            </button>
          </div>
          <div className="activity-list">
            {mine.length === 0 ? (
              <div className="quiet-empty">
                <Check size={22} />
                <p>All clear for now. Your reports will appear here.</p>
              </div>
            ) : (
              mine.slice(0, 3).map((item) => (
                <button
                  className="activity-row"
                  key={item.id}
                  onClick={() => onOpen(item.id)}
                >
                  <ItemPhoto item={item} />
                  <div className="activity-copy">
                    <strong>{item.title}</strong>
                    <small>
                      {item.type === 'lost' ? 'Lost' : 'Found'} <span>·</span>{' '}
                      {formatDate(item.date)} <span>·</span>{' '}
                      {locationName(item.locationId)}
                    </small>
                  </div>
                  <StatusBadge status={item.status} />
                  <ChevronRight size={16} />
                </button>
              ))
            )}
          </div>
        </section>
        <aside className="pickup-note">
          <div className="pickup-heading">
            <ShieldCheck size={23} strokeWidth={1.5} />
            <span>CAMPUS SECURITY</span>
          </div>
          <h3>
            Your belongings.
            <br />
            Back where they belong.
          </h3>
          <p>
            Found items are held safely at the Security Office until their
            owners are verified.
          </p>
          <div>
            <MapPin size={14} />
            <span>Main Entrance, Ground Floor</span>
          </div>
          <div>
            <Clock3 size={14} />
            <span>Mon–Fri, 8:00 AM–5:00 PM</span>
          </div>
          <button className="text-link" onClick={() => onNavigate('help')}>
            A quick guide to claiming <ArrowUpRight size={14} />
          </button>
        </aside>
      </div>
      <div className="community-line">
        <HeartHandshake size={16} />
        <p>
          Every returned item starts with someone who cares.{' '}
          <strong>Thanks for being that someone.</strong>
        </p>
      </div>
    </>
  );
}
