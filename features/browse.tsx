'use client';
import { useState } from 'react';
import {
  Grid2X2,
  List,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { ItemCard } from '@/components/item-card';
import { ViewHeader, EmptyState, Field } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { CATEGORIES, STATUSES } from '@/lib/types';
import { COLORS } from '@/lib/schemas';
import { LOCATIONS } from '@/lib/seed';
import { useDemo } from '@/lib/demo-store';
export function BrowseView({
  query,
  setQuery,
  onOpen,
  onSave,
  onReport,
}: {
  query: string;
  setQuery: (v: string) => void;
  onOpen: (id: string) => void;
  onSave: (id: string) => void;
  onReport: () => void;
}) {
  const { state } = useDemo();
  const [type, setType] = useState('all'),
    [category, setCategory] = useState(''),
    [location, setLocation] = useState(''),
    [color, setColor] = useState(''),
    [status, setStatus] = useState(''),
    [from, setFrom] = useState(''),
    [to, setTo] = useState(''),
    [filters, setFilters] = useState(false),
    [grid, setGrid] = useState(true),
    [sort, setSort] = useState('newest');
  const filtered = state.reports
    .filter(
      (r) =>
        r.status !== 'Draft' &&
        (type === 'all' || r.type === type) &&
        (!category || r.category === category) &&
        (!location || r.locationId === location) &&
        (!color || r.color === color) &&
        (!status || r.status === status) &&
        (!from || r.date >= from) &&
        (!to || r.date <= to) &&
        query
          .toLowerCase()
          .trim()
          .split(/\s+/)
          .every((w) =>
            `${r.title} ${r.description} ${r.category} ${r.color} ${r.brand} ${r.reference}`
              .toLowerCase()
              .includes(w),
          ),
    )
    .sort((a, b) =>
      sort === 'newest'
        ? b.date.localeCompare(a.date)
        : sort === 'oldest'
          ? a.date.localeCompare(b.date)
          : a.title.localeCompare(b.title),
    );
  const count = [category, location, color, status, from, to].filter(
    Boolean,
  ).length;
  function clear() {
    setCategory('');
    setLocation('');
    setColor('');
    setStatus('');
    setFrom('');
    setTo('');
    setQuery('');
    setType('all');
  }
  return (
    <>
      <ViewHeader
        eyebrow="THE CAMPUS NOTICEBOARD"
        title="Find a familiar thing."
        description="One search closer to getting it back."
      >
        <Button onClick={onReport}>
          <Plus size={16} />
          Report an item
        </Button>
      </ViewHeader>
      <div className="browse-tools">
        <div className="search-input">
          <Search size={18} />
          <Input
            aria-label="Search reports"
            placeholder="Search items, colors, brands, or reference number…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button aria-label="Clear search" onClick={() => setQuery('')}>
              <X size={16} />
            </button>
          )}
        </div>
        <Button
          variant="outline"
          onClick={() => setFilters(!filters)}
          aria-expanded={filters}
        >
          <SlidersHorizontal size={16} />
          Filters{count > 0 && <span className="filter-count">{count}</span>}
        </Button>
      </div>
      {filters && (
        <div className="filter-panel">
          <Field label="Category" htmlFor="filter-category">
            <NativeSelect
              id="filter-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Location" htmlFor="filter-location">
            <NativeSelect
              id="filter-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option value="">All campus locations</option>
              {LOCATIONS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Color" htmlFor="filter-color">
            <NativeSelect
              id="filter-color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            >
              <option value="">Any color</option>
              {COLORS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Report status" htmlFor="filter-status">
            <NativeSelect
              id="filter-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All statuses</option>
              {STATUSES.filter((s) => s !== 'Draft').map((s) => (
                <option key={s}>{s}</option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="From date" htmlFor="filter-from">
            <Input
              type="date"
              id="filter-from"
              value={from}
              max={to || undefined}
              onChange={(e) => setFrom(e.target.value)}
            />
          </Field>
          <Field label="To date" htmlFor="filter-to">
            <Input
              type="date"
              id="filter-to"
              value={to}
              min={from || undefined}
              onChange={(e) => setTo(e.target.value)}
            />
          </Field>
          <Button variant="ghost" onClick={clear}>
            Clear all filters
          </Button>
        </div>
      )}
      <div className="browse-bar">
        <div className="tabs">
          <button
            onClick={() => setType('all')}
            className={type === 'all' ? 'active' : ''}
          >
            All items
          </button>
          <button
            onClick={() => setType('found')}
            className={type === 'found' ? 'active' : ''}
          >
            Found items
          </button>
          <button
            onClick={() => setType('lost')}
            className={type === 'lost' ? 'active' : ''}
          >
            Lost items
          </button>
        </div>
        <div className="view-controls">
          <NativeSelect
            aria-label="Sort reports"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="title">Item name</option>
          </NativeSelect>
          <div className="view-toggle">
            <button
              aria-label="Grid view"
              aria-pressed={grid}
              className={grid ? 'selected' : ''}
              onClick={() => setGrid(true)}
            >
              <Grid2X2 size={16} />
            </button>
            <button
              aria-label="List view"
              aria-pressed={!grid}
              className={!grid ? 'selected' : ''}
              onClick={() => setGrid(false)}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>
      <p className="result-count">
        {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
        {query && (
          <>
            {' '}
            matching <strong>“{query}”</strong>
          </>
        )}
        {count > 0 && (
          <button onClick={clear}>
            Reset filters <X size={12} />
          </button>
        )}
      </p>
      {filtered.length ? (
        <div className={grid ? 'item-grid browse-grid' : 'item-list'}>
          {filtered.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onOpen={onOpen}
              onSave={onSave}
              saved={state.saved[state.currentUserId!]?.includes(item.id)}
              compact={!grid}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No items match just yet"
          description="Try a different keyword or clear a filter. New items are reported every day."
        >
          <Button variant="outline" onClick={clear}>
            Clear filters
          </Button>
          <Button onClick={onReport}>Report a lost item</Button>
        </EmptyState>
      )}
    </>
  );
}
