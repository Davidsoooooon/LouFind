'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  LockKeyhole,
  Pencil,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { NativeSelect } from '@/components/ui/native-select';
import { Field, Modal, PhotoUpload } from '@/components/common';
import { ItemPhoto, StatusBadge } from '@/components/item-card';
import { useDemo } from '@/lib/demo-store';
import type { ItemReport } from '@/lib/types';
import { claimSchema } from '@/lib/schemas';
import { formatDate, locationName } from '@/lib/seed';
import { findMatches } from '@/lib/services/matching';
import { submitClaim } from '@/lib/services/workflows';
export function ItemDetails({
  id,
  onClose,
  onOpen,
  onSave,
  onEdit,
  onManage,
}: {
  id: string;
  onClose: () => void;
  onOpen: (id: string) => void;
  onSave: (id: string) => void;
  onEdit: (r: ItemReport) => void;
  onManage: () => void;
}) {
  const { state, transact } = useDemo();
  const item = state.reports.find((r) => r.id === id)!;
  const user = state.profiles.find((p) => p.id === state.currentUserId)!;
  const [claiming, setClaiming] = useState(false),
    [success, setSuccess] = useState(false),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  const own = item.reporterId === user.id;
  const saved = state.saved[user.id]?.includes(id);
  const claim = state.claims.find(
    (c) => c.reportId === id && c.claimantId === user.id,
  );
  const matches = findMatches(state.reports).filter(
    (m) => m.lostReportId === id || m.foundReportId === id,
  );
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<z.infer<typeof claimSchema>>({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      details: '',
      contents: '',
      proof: '',
      imageUrl: '',
      lostReportId: '',
    },
  });
  const canClaim =
    item.type === 'found' &&
    !own &&
    !['Returned', 'Ready for Pickup', 'Unclaimed', 'Draft'].includes(
      item.status,
    ) &&
    (!claim || claim.status === 'Rejected');
  return (
    <Modal
      wide
      title={
        success
          ? 'Claim received'
          : claiming
            ? 'A few details only you would know'
            : item.title
      }
      description={
        claiming
          ? 'Your answers are private and reviewed by campus security.'
          : `Report ${item.reference}`
      }
      onClose={onClose}
    >
      {success ? (
        <div className="success-state">
          <CheckCircle2 size={48} strokeWidth={1.4} />
          <h2>We’ll take it from here.</h2>
          <p>
            Campus security will review your evidence for{' '}
            <strong>{item.title}</strong>. You’ll receive an in-app update when
            they’ve made a decision.
          </p>
          <div className="info-note">
            <ShieldCheck size={20} />
            <span>
              Please wait for approval before visiting to collect the item. A
              match score does not release it automatically.
            </span>
          </div>
          <Button onClick={onClose}>
            Got it
            <CheckCircle2 size={15} />
          </Button>
        </div>
      ) : claiming ? (
        <form
          onSubmit={handleSubmit((data) => {
            try {
              transact((s) =>
                submitClaim(s, {
                  ...data,
                  id: crypto.randomUUID(),
                  reportId: id,
                  claimantId: user.id,
                  status: 'Under Review',
                  createdAt: new Date().toISOString(),
                  reviewNote: '',
                }),
              );
              setSuccess(true);
            } catch (e) {
              setError((e as Error).message);
            }
          })}
        >
          <div className="form-body">
            <div className="info-note">
              <LockKeyhole size={18} />
              <span>
                Don’t repeat only what is visible in the photo. Give specific
                details a finder wouldn’t know.
              </span>
            </div>
            <Field
              label="Link to your lost report (optional)"
              htmlFor="claim-lost-report"
              hint="This report will close only after security verifies ownership and records the return."
            >
              <NativeSelect
                id="claim-lost-report"
                {...register('lostReportId')}
              >
                <option value="">I haven't filed a lost report</option>
                {state.reports
                  .filter(
                    (r) =>
                      r.reporterId === user.id &&
                      r.type === 'lost' &&
                      !['Draft', 'Returned', 'Unclaimed'].includes(r.status),
                  )
                  .map((r) => (
                    <option value={r.id} key={r.id}>
                      {r.title} · {r.reference}
                    </option>
                  ))}
              </NativeSelect>
            </Field>
            <Field
              label="Unique marks, ID details, or scratches *"
              htmlFor="claim-details"
              error={errors.details?.message}
            >
              <Textarea
                id="claim-details"
                rows={3}
                placeholder="e.g. My initials are written inside the cover…"
                {...register('details')}
              />
            </Field>
            <Field
              label="Contents or other private details"
              htmlFor="claim-contents"
              error={errors.contents?.message}
            >
              <Textarea
                id="claim-contents"
                placeholder="What is inside? Is there an accessory?"
                {...register('contents')}
              />
            </Field>
            <Field
              label="Proof of ownership you can provide *"
              htmlFor="claim-proof"
              error={errors.proof?.message}
            >
              <Textarea
                id="claim-proof"
                placeholder="A receipt, a photo from before it was lost, a pairing record…"
                {...register('proof')}
              />
            </Field>
            <PhotoUpload
              label="Supporting image"
              value={watch('imageUrl')}
              onChange={(v) => setValue('imageUrl', v)}
              onBusy={setBusy}
            />
            <p className="field-hint">
              Local demo: use sample information, not real identity documents.
            </p>
            {error && (
              <p className="error-note" role="alert">
                {error}
              </p>
            )}
          </div>
          <div className="form-footer">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setClaiming(false)}
            >
              <ArrowLeft size={15} />
              Back to item
            </Button>
            <Button type="submit" disabled={busy}>
              Submit private claim
              <ArrowRight size={15} />
            </Button>
          </div>
        </form>
      ) : (
        <>
          <div className="detail-body">
            <ItemPhoto item={item} className="detail-photo" />
            <div className="detail-top">
              <span className={`detail-type ${item.type}`}>
                {item.type.toUpperCase()} ITEM
              </span>
              <StatusBadge status={item.status} />
              <button
                className="detail-save text-link"
                onClick={() => onSave(id)}
              >
                <Bookmark size={15} fill={saved ? 'currentColor' : 'none'} />
                {saved ? 'Saved' : 'Save item'}
              </button>
            </div>
            <p className="detail-description">{item.description}</p>
            <dl className="detail-facts">
              <div>
                <dt>Category</dt>
                <dd>{item.category}</dd>
              </div>
              <div>
                <dt>Color</dt>
                <dd>{item.color}</dd>
              </div>
              <div>
                <dt>{item.type === 'lost' ? 'Last seen' : 'Found at'}</dt>
                <dd>{locationName(item.locationId)}</dd>
              </div>
              <div>
                <dt>Date & time</dt>
                <dd>
                  {formatDate(item.date)} · {item.time}
                </dd>
              </div>
              {item.brand && (
                <div>
                  <dt>Brand</dt>
                  <dd>{item.brand}</dd>
                </div>
              )}
              <div>
                <dt>Reference</dt>
                <dd>{item.reference}</dd>
              </div>
            </dl>
            {(own || user.role === 'security') && item.identifyingFeatures && (
              <div className="private-details">
                <strong>
                  <LockKeyhole size={14} />
                  Private identifying features
                </strong>
                <p>{item.identifyingFeatures}</p>
              </div>
            )}
            {claim && (
              <div className="claim-summary">
                <div className="section-heading">
                  <h3>Your ownership claim</h3>
                  <StatusBadge status={claim.status} />
                </div>
                <p>
                  {claim.status === 'Under Review'
                    ? 'Security is reviewing the private evidence you submitted.'
                    : claim.status === 'Ready for Pickup'
                      ? 'Bring your school ID to the Security Office at the Main Entrance, Mon–Fri 8 AM–5 PM.'
                      : claim.status === 'Returned'
                        ? 'This item has been returned. We’re glad it found its way home.'
                        : 'Your claim needs additional evidence. You may submit a new claim.'}
                </p>
                {claim.reviewNote && (
                  <p>
                    <strong>Review note: </strong>
                    {claim.reviewNote}
                  </p>
                )}
              </div>
            )}
            {matches.length > 0 && (
              <div className="detail-matches">
                <h3>Possible matches</h3>
                {matches.map((m) => {
                  const other = state.reports.find(
                    (r) =>
                      r.id ===
                      (m.lostReportId === id
                        ? m.foundReportId
                        : m.lostReportId),
                  )!;
                  return (
                    <button key={m.id} onClick={() => onOpen(other.id)}>
                      <span>
                        <strong>{other.title}</strong>
                        <small>{m.reasons.slice(0, 2).join(' · ')}</small>
                      </span>
                      <span>
                        {m.score}% <ArrowRight size={14} />
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
            <div className="info-note">
              <ShieldCheck size={19} />
              <span>
                Reporter details and exact storage locations are never shown
                publicly. Ownership is verified by campus security.
              </span>
            </div>
          </div>
          <div className="form-footer">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {user.role === 'security' ? (
              <Button onClick={onManage}>
                Manage with security
                <ArrowRight size={15} />
              </Button>
            ) : own &&
              ![
                'Under Review',
                'Ready for Pickup',
                'Returned',
                'Unclaimed',
              ].includes(item.status) ? (
              <Button onClick={() => onEdit(item)}>
                <Pencil size={15} />
                Edit report
              </Button>
            ) : canClaim ? (
              <Button onClick={() => setClaiming(true)}>
                This might be mine
                <ArrowRight size={15} />
              </Button>
            ) : (
              <span className="field-hint">
                {own
                  ? 'You reported this item'
                  : claim
                    ? 'Track your claim in My activity'
                    : 'This item is not accepting claims'}
              </span>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}
