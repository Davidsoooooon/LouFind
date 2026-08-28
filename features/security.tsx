/* oxlint-disable next/no-img-element -- Locally optimized assets and browser-only upload previews. */
'use client';
import { useState } from 'react';
import {
  Check,
  ChevronRight,
  Clock3,
  PackageCheck,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState, Field, Modal, ViewHeader } from '@/components/common';
import { ItemPhoto, StatusBadge } from '@/components/item-card';
import { useDemo } from '@/lib/demo-store';
import { formatDate, locationName } from '@/lib/seed';
import { manageReport, reviewClaim } from '@/lib/services/workflows';
import type { OwnershipClaim, ReportStatus } from '@/lib/types';
export function SecurityView({ onOpen }: { onOpen: (id: string) => void }) {
  const { state, transact } = useDemo();
  const [tab, setTab] = useState('claims'),
    [query, setQuery] = useState(''),
    [statusFilter, setStatusFilter] = useState(''),
    [reviewId, setReviewId] = useState<string | null>(null),
    [manageId, setManageId] = useState<string | null>(null),
    [note, setNote] = useState(''),
    [storage, setStorage] = useState(''),
    [status, setStatus] = useState<ReportStatus>('Reported'),
    [confirmed, setConfirmed] = useState(false),
    [error, setError] = useState('');
  const user = state.profiles.find((p) => p.id === state.currentUserId)!;
  if (user.role !== 'security')
    return (
      <EmptyState
        title="Security access required"
        description="Switch to the campus security demo account to view this workspace."
      />
    );
  const reports = state.reports.filter((r) => r.status !== 'Draft');
  const found = reports.filter((r) => r.type === 'found');
  const returned = found.filter((r) => r.status === 'Returned').length;
  const pending = state.claims.filter((c) => c.status === 'Under Review');
  const unclaimed = found.filter((r) => r.status === 'Unclaimed').length;
  const rate = found.length ? Math.round((returned / found.length) * 100) : 0;
  const review = state.claims.find((c) => c.id === reviewId),
    item = state.reports.find((r) => r.id === review?.reportId),
    managed = state.reports.find((r) => r.id === manageId);
  const filtered = reports.filter(
    (r) =>
      (!statusFilter || r.status === statusFilter) &&
      `${r.title} ${r.reference} ${r.type}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  function openReview(c: OwnershipClaim) {
    setReviewId(c.id);
    setNote('');
    setError('');
    setConfirmed(false);
  }
  function decide(approve: boolean) {
    try {
      if (approve && !confirmed)
        throw new Error('Confirm that you compared the ownership evidence.');
      transact((s) => reviewClaim(s, reviewId!, approve, note));
      setReviewId(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <>
      <ViewHeader
        eyebrow="CAMPUS SECURITY WORKSPACE"
        title="A safe return starts here."
        description="Review the evidence. Keep a record. Make someone’s day."
      >
        <span className="security-label">
          <ShieldCheck size={16} />
          Authorized demo view
        </span>
      </ViewHeader>
      <div className="stats-grid">
        {[
          [
            'Active reports',
            reports.filter((r) => !['Returned', 'Unclaimed'].includes(r.status))
              .length,
          ],
          ['Items returned', returned],
          ['Pending claims', pending.length],
          ['Unclaimed items', unclaimed],
        ].map(([label, value]) => (
          <div className="stat" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>From current demo records</small>
          </div>
        ))}
        <div className="stat recovery">
          <span>Recovery rate</span>
          <strong>
            {rate}
            <small>%</small>
          </strong>
          <Progress value={rate} aria-label="Recovery rate" />
          <small>
            {returned} of {found.length} found items returned
          </small>
        </div>
      </div>
      <div className="tabs activity-tabs">
        <button
          className={tab === 'claims' ? 'active' : ''}
          onClick={() => setTab('claims')}
        >
          Claim review <span>{pending.length}</span>
        </button>
        <button
          className={tab === 'reports' ? 'active' : ''}
          onClick={() => setTab('reports')}
        >
          All reports
        </button>
        <button
          className={tab === 'log' ? 'active' : ''}
          onClick={() => setTab('log')}
        >
          Activity log
        </button>
      </div>
      {tab === 'claims' ? (
        <>
          {pending.length ? (
            <div className="security-claims">
              {pending.map((c) => {
                const r = state.reports.find((v) => v.id === c.reportId)!;
                const claimant = state.profiles.find(
                  (p) => p.id === c.claimantId,
                )!;
                return (
                  <article className="security-claim" key={c.id}>
                    <ItemPhoto item={r} />
                    <div>
                      <span className="eyebrow">OWNERSHIP CLAIM</span>
                      <h3>{r.title}</h3>
                      <p>
                        {claimant.name} <span>·</span> {formatDate(c.createdAt)}
                      </p>
                      <StatusBadge status={c.status} />
                    </div>
                    <Button onClick={() => openReview(c)}>
                      Review evidence
                      <ChevronRight size={15} />
                    </Button>
                  </article>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No claims waiting"
              description="You’ve reviewed every pending claim. Approved items are ready for pickup."
            />
          )}
          <div className="info-note">
            <ShieldCheck size={19} />
            <span>
              Compare private report details with the claimant’s evidence.
              Approve only after verifying ownership. Always check ID again at
              pickup.
            </span>
          </div>
        </>
      ) : tab === 'reports' ? (
        <>
          <div className="browse-tools">
            <div className="search-input">
              <Search size={18} />
              <Input
                aria-label="Search all reports"
                placeholder="Search by item or reference…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <NativeSelect
              aria-label="Filter report status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All statuses</option>
              {[
                'Reported',
                'Possible Match',
                'Under Review',
                'Ready for Pickup',
                'Returned',
                'Unclaimed',
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </NativeSelect>
          </div>
          <div className="reports-table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item / reference</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <button
                        className="table-item"
                        onClick={() => onOpen(r.id)}
                      >
                        <strong>{r.title}</strong>
                        <small>{r.reference}</small>
                      </button>
                    </TableCell>
                    <TableCell className="capitalize">{r.type}</TableCell>
                    <TableCell>{locationName(r.locationId)}</TableCell>
                    <TableCell>{formatDate(r.date)}</TableCell>
                    <TableCell>
                      <StatusBadge status={r.status} />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setManageId(r.id);
                          setStatus(r.status);
                          setStorage(r.storageLocation);
                          setConfirmed(false);
                          setError('');
                        }}
                      >
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!filtered.length && (
              <EmptyState
                title="No reports found"
                description="Try another search or status."
              />
            )}
          </div>
        </>
      ) : (
        <div className="log-list">
          {state.logs
            .slice()
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .map((log) => (
              <div key={log.id}>
                <Clock3 size={17} />
                <span>
                  <p>{log.message}</p>
                  <small>
                    {state.profiles.find((p) => p.id === log.actorId)?.name ||
                      'Campus security'}{' '}
                    · {formatDate(log.createdAt)}
                  </small>
                </span>
              </div>
            ))}
        </div>
      )}
      {review && item && (
        <Modal
          wide
          title="Review ownership evidence"
          description={`${item.title} · ${item.reference}`}
          onClose={() => setReviewId(null)}
        >
          <div className="form-body">
            <div className="review-columns">
              <div className="private-details">
                <strong>Finder’s private details</strong>
                <p>
                  {item.identifyingFeatures ||
                    'No private details recorded. Request stronger evidence before approval.'}
                </p>
                <small>Storage: {item.storageLocation || 'Not recorded'}</small>
              </div>
              <div className="private-details">
                <strong>Claimant</strong>
                <p>
                  {state.profiles.find((p) => p.id === review.claimantId)?.name}
                </p>
                <small>
                  {
                    state.profiles.find((p) => p.id === review.claimantId)
                      ?.schoolId
                  }
                </small>
              </div>
            </div>
            <dl className="claim-evidence">
              <dt>Identifying marks / ID details</dt>
              <dd>{review.details}</dd>
              <dt>Contents or other details</dt>
              <dd>{review.contents || 'None provided'}</dd>
              <dt>Proof of ownership</dt>
              <dd>{review.proof}</dd>
            </dl>
            {review.imageUrl && (
              <img
                className="evidence-image"
                src={review.imageUrl}
                alt="Private supporting evidence"
              />
            )}
            <Field
              label="Review note / pickup instructions *"
              htmlFor="review-note"
              hint="This note will be sent to the claimant."
            >
              <Textarea
                id="review-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Explain the decision and any pickup requirements…"
              />
            </Field>
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              />
              I compared the private details and verified the evidence.
            </label>
            {error && (
              <div className="error-note" role="alert">
                {error}
              </div>
            )}
          </div>
          <div className="form-footer">
            <Button variant="destructive" onClick={() => decide(false)}>
              <X size={15} />
              Reject claim
            </Button>
            <Button onClick={() => decide(true)}>
              <Check size={15} />
              Approve for pickup
            </Button>
          </div>
        </Modal>
      )}
      {managed && (
        <Modal
          title="Manage report"
          description={`${managed.title} · ${managed.reference}`}
          onClose={() => setManageId(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              try {
                if (
                  status === 'Returned' &&
                  managed.status !== 'Returned' &&
                  !confirmed
                )
                  throw new Error(
                    'Confirm that you checked ID and handed over the item.',
                  );
                transact((s) => manageReport(s, managed.id, status, storage));
                setManageId(null);
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          >
            <div className="form-body">
              <Field label="Report status" htmlFor="manage-status">
                <NativeSelect
                  id="manage-status"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value as ReportStatus);
                    setConfirmed(false);
                  }}
                >
                  {[
                    'Reported',
                    'Possible Match',
                    'Under Review',
                    ...(managed.status === 'Ready for Pickup'
                      ? ['Ready for Pickup']
                      : []),
                    'Returned',
                    'Unclaimed',
                  ].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </NativeSelect>
              </Field>
              {managed.type === 'found' && (
                <Field
                  label="Private storage location"
                  htmlFor="storage-location"
                  hint="Visible only in the security workspace."
                >
                  <Input
                    id="storage-location"
                    value={storage}
                    maxLength={150}
                    onChange={(e) => setStorage(e.target.value)}
                    placeholder="e.g. Security Office · Cabinet B, Shelf 2"
                  />
                </Field>
              )}
              {status === 'Returned' && managed.status !== 'Returned' && (
                <label className="checkbox-field">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                  />
                  I checked the verified claimant’s ID and handed over the item.
                </label>
              )}
              <div className="info-note">
                <PackageCheck size={18} />
                <span>
                  Only items with an approved claim can be marked returned.
                  Approve ownership from Claim review first.
                </span>
              </div>
              {error && (
                <div className="error-note" role="alert">
                  {error}
                </div>
              )}
            </div>
            <div className="form-footer">
              <Button
                type="button"
                variant="outline"
                onClick={() => setManageId(null)}
              >
                Cancel
              </Button>
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
