/* oxlint-disable next/no-img-element -- Locally optimized assets and browser-only upload previews. */
'use client';
import { Bookmark, CalendarDays, MapPin, Package } from 'lucide-react';
import { useState } from 'react';
import { formatDate, locationName } from '@/lib/seed';
import type { ItemReport, ReportStatus } from '@/lib/types';
export function StatusBadge({ status }: { status: ReportStatus }) {
  return (
    <span
      className={`status status-${status.toLowerCase().replaceAll(' ', '-')}`}
    >
      <span />
      {status}
    </span>
  );
}
export function ItemPhoto({
  item,
  className = '',
}: {
  item: Pick<ItemReport, 'imageUrl' | 'title'>;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`item-photo ${className}`}>
      {item.imageUrl && !failed ? (
        <img
          src={item.imageUrl}
          alt={item.title}
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="no-photo">
          <Package size={35} strokeWidth={1.1} />
          <span>No photo provided</span>
        </div>
      )}
    </div>
  );
}
export function ItemCard({
  item,
  saved = false,
  onOpen,
  onSave,
  compact = false,
}: {
  item: ItemReport;
  saved?: boolean;
  onOpen: (id: string) => void;
  onSave: (id: string) => void;
  compact?: boolean;
}) {
  return (
    <article className={`item-card ${compact ? 'list-item-card' : ''}`}>
      <div className="item-card-image">
        <button
          className="photo-link"
          onClick={() => onOpen(item.id)}
          aria-label={`View ${item.title}`}
        >
          <ItemPhoto item={item} />
        </button>
        <span className={`type-label ${item.type}`}>
          {item.type === 'found' ? 'FOUND' : 'LOST'}
        </span>
        <button
          className={`save-button ${saved ? 'saved' : ''}`}
          onClick={() => onSave(item.id)}
          aria-label={saved ? `Unsave ${item.title}` : `Save ${item.title}`}
          aria-pressed={saved}
        >
          <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="item-card-copy">
        <span className="category-label">{item.category}</span>
        <button className="item-title" onClick={() => onOpen(item.id)}>
          {item.title}
        </button>
        <p>
          <MapPin size={13} />
          {locationName(item.locationId)}
        </p>
        <div className="card-meta">
          <span>
            <CalendarDays size={12} />
            {formatDate(item.date)}
          </span>
          <StatusBadge status={item.status} />
        </div>
      </div>
    </article>
  );
}
