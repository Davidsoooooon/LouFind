'use client';
import { useEffect, useRef, useState } from 'react';
import { useForm, type FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  FileCheck2,
  LockKeyhole,
  Save,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { NativeSelect } from '@/components/ui/native-select';
import { Button } from '@/components/ui/button';
import { Field, Modal, PhotoUpload } from '@/components/common';
import { ItemPhoto } from '@/components/item-card';
import {
  CATEGORIES,
  type ItemReport,
  type ReportInput,
  type ReportType,
} from '@/lib/types';
import { COLORS, reportSchema } from '@/lib/schemas';
import { LOCATIONS, formatDate, locationName } from '@/lib/seed';
import { createId } from '@/lib/browser-crypto';
export function ReportForm({
  type,
  initial,
  onClose,
  onSave,
}: {
  type: ReportType;
  initial?: ItemReport;
  onClose: () => void;
  onSave: (data: ReportInput, id: string, draft: boolean) => string;
}) {
  const [step, setStep] = useState(0),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [success, setSuccess] = useState(''),
    [saved, setSaved] = useState(false);
  const [id] = useState(() => initial?.id || createId());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveRef = useRef(onSave);
  saveRef.current = onSave;
  const {
    register,
    watch,
    getValues,
    setValue,
    trigger,
    handleSubmit,
    formState: { errors },
  } = useForm<ReportInput>({
    resolver: zodResolver(reportSchema),
    defaultValues: initial || {
      type,
      title: '',
      category: 'Other',
      color: '',
      brand: '',
      description: '',
      identifyingFeatures: '',
      date: new Date().toLocaleDateString('en-CA'),
      time: '12:00',
      locationId: '',
      imageUrl: '',
      contactPreference: 'In-app notifications',
    },
  });
  const data = watch();
  const published = useRef(false);
  useEffect(() => {
    const subscription = watch((values) => {
      setSaved(false);
      if (timer.current) clearTimeout(timer.current);
      if (
        !values.title?.trim() &&
        !values.description?.trim() &&
        !values.imageUrl
      )
        return;
      timer.current = setTimeout(() => {
        if (published.current) return;
        try {
          saveRef.current(getValues(), id, true);
          setSaved(true);
        } catch (e) {
          setError((e as Error).message);
        }
      }, 650);
    });
    return () => {
      subscription.unsubscribe();
      if (timer.current) clearTimeout(timer.current);
    };
  }, [watch, getValues, id]);
  function close() {
    if (busy) {
      setError('Please wait for your photo to finish processing.');
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    if (
      !published.current &&
      (data.title.trim() || data.description.trim() || data.imageUrl)
    ) {
      try {
        onSave(getValues(), id, true);
      } catch (e) {
        setError((e as Error).message);
        return;
      }
    }
    onClose();
  }
  async function next() {
    const fields: FieldPath<ReportInput>[] =
      step === 0
        ? ['title', 'category', 'color']
        : [
            'description',
            'date',
            'time',
            'locationId',
            'brand',
            'identifyingFeatures',
          ];
    if (await trigger(fields, { shouldFocus: true })) setStep(step + 1);
  }
  const submit = handleSubmit((values) => {
    if (timer.current) clearTimeout(timer.current);
    try {
      published.current = true;
      setSuccess(onSave(values, id, false));
    } catch (e) {
      published.current = false;
      setError((e as Error).message);
    }
  });
  return (
    <Modal
      wide
      title={
        success
          ? 'Report received'
          : initial
            ? 'Continue your report'
            : 'Report an item'
      }
      description={
        success
          ? 'Your campus community can now help.'
          : 'Choose lost or found, add details, then review your report.'
      }
      onClose={close}
    >
      {success ? (
        <div className="success-state">
          <CheckCircle2 size={48} strokeWidth={1.4} />
          <h2>Your {data.type} report is live.</h2>
          <p>
            Reference <strong>{success}</strong>
          </p>
          <p>
            We’ll check for possible matches and notify you here. Your private
            identifying details are only shown to security.
          </p>
          <Button onClick={onClose}>
            Done <ArrowRight size={16} />
          </Button>
        </div>
      ) : (
        <>
          <div className="form-steps">
            {['The item', 'When & where', 'Review'].map((s, i) => (
              <div
                key={s}
                className={i <= step ? 'current' : ''}
                aria-current={i === step ? 'step' : undefined}
              >
                <span>{i < step ? <Check size={13} /> : i + 1}</span>
                {s}
              </div>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (step < 2) void next();
              else void submit();
            }}
          >
            <div className="form-body">
              {step === 0 && (
                <>
                  <div className="segmented-control report-type">
                    <button
                      type="button"
                      aria-pressed={data.type === 'lost'}
                      className={data.type === 'lost' ? 'selected' : ''}
                      onClick={() =>
                        setValue('type', 'lost', { shouldDirty: true })
                      }
                    >
                      I lost an item
                    </button>
                    <button
                      type="button"
                      aria-pressed={data.type === 'found'}
                      className={data.type === 'found' ? 'selected' : ''}
                      onClick={() =>
                        setValue('type', 'found', { shouldDirty: true })
                      }
                    >
                      I found an item
                    </button>
                  </div>
                  <PhotoUpload
                    value={data.imageUrl}
                    onChange={(v) =>
                      setValue('imageUrl', v, { shouldDirty: true })
                    }
                    onBusy={setBusy}
                  />
                  <p className="field-hint">
                    Hide names, ID numbers, and unique marks in public photos.
                  </p>
                  <Field
                    label="What is the item? *"
                    htmlFor="report-title"
                    error={errors.title?.message}
                  >
                    <Input
                      id="report-title"
                      placeholder="e.g. Black scientific calculator"
                      {...register('title')}
                      aria-invalid={!!errors.title}
                    />
                  </Field>
                  <div className="form-grid">
                    <Field
                      label="Category *"
                      htmlFor="report-category"
                      error={errors.category?.message}
                    >
                      <NativeSelect
                        id="report-category"
                        {...register('category')}
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </NativeSelect>
                    </Field>
                    <Field
                      label="Color *"
                      htmlFor="report-color"
                      error={errors.color?.message}
                    >
                      <NativeSelect id="report-color" {...register('color')}>
                        <option value="">Choose color</option>
                        {COLORS.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </NativeSelect>
                    </Field>
                  </div>
                </>
              )}
              {step === 1 && (
                <>
                  <Field
                    label="Public description *"
                    htmlFor="report-description"
                    hint="Describe the item without revealing private identifying details."
                    error={errors.description?.message}
                  >
                    <Textarea
                      id="report-description"
                      rows={3}
                      placeholder="What does it look like? Where was it last seen?"
                      {...register('description')}
                    />
                  </Field>
                  <Field
                    label="Brand (optional)"
                    htmlFor="report-brand"
                    error={errors.brand?.message}
                  >
                    <Input
                      id="report-brand"
                      placeholder="e.g. Casio"
                      {...register('brand')}
                    />
                  </Field>
                  <Field
                    label="Private identifying features"
                    htmlFor="report-features"
                    hint="Only you and campus security can see these details."
                    error={errors.identifyingFeatures?.message}
                  >
                    <Textarea
                      id="report-features"
                      placeholder="Unique marks, serial number, contents…"
                      {...register('identifyingFeatures')}
                    />
                  </Field>
                  <div className="form-grid">
                    <Field
                      label={
                        data.type === 'lost'
                          ? 'Date last seen *'
                          : 'Date found *'
                      }
                      htmlFor="report-date"
                      error={errors.date?.message}
                    >
                      <Input
                        type="date"
                        id="report-date"
                        max={new Date().toLocaleDateString('en-CA')}
                        {...register('date')}
                      />
                    </Field>
                    <Field
                      label="Approximate time *"
                      htmlFor="report-time"
                      error={errors.time?.message}
                    >
                      <Input
                        type="time"
                        id="report-time"
                        {...register('time')}
                      />
                    </Field>
                  </div>
                  <Field
                    label="Campus location *"
                    htmlFor="report-location"
                    error={errors.locationId?.message}
                  >
                    <NativeSelect
                      id="report-location"
                      {...register('locationId')}
                    >
                      <option value="">Choose a location</option>
                      {LOCATIONS.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name}
                        </option>
                      ))}
                    </NativeSelect>
                  </Field>
                  <Field label="Contact preference" htmlFor="report-contact">
                    <NativeSelect
                      id="report-contact"
                      {...register('contactPreference')}
                    >
                      <option>In-app notifications</option>
                      <option>Contact through campus security</option>
                    </NativeSelect>
                  </Field>
                </>
              )}
              {step === 2 && (
                <div className="review-summary">
                  <ItemPhoto
                    item={{ imageUrl: data.imageUrl, title: data.title }}
                  />
                  <div className="eyebrow">{data.type.toUpperCase()} ITEM</div>
                  <h2>{data.title}</h2>
                  <p>{data.description}</p>
                  <dl>
                    <dt>Category & color</dt>
                    <dd>
                      {data.category} · {data.color}
                    </dd>
                    <dt>When</dt>
                    <dd>
                      {formatDate(data.date)} at {data.time}
                    </dd>
                    <dt>Where</dt>
                    <dd>{locationName(data.locationId)}</dd>
                    <dt>Brand</dt>
                    <dd>{data.brand || 'Not specified'}</dd>
                  </dl>
                  <div className="info-note">
                    <LockKeyhole size={18} />
                    <span>
                      Your contact information and identifying features stay
                      private.{' '}
                      {data.type === 'found'
                        ? 'Please hand the item to campus security.'
                        : 'A possible match does not prove ownership.'}
                    </span>
                  </div>
                </div>
              )}
              {error && (
                <div className="error-note" role="alert">
                  {error}
                </div>
              )}
            </div>
            <div className="form-footer">
              <Button
                type="button"
                variant="ghost"
                disabled={busy}
                onClick={() => {
                  if (step > 0) setStep(step - 1);
                  else {
                    try {
                      onSave(getValues(), id, true);
                      onClose();
                    } catch (e) {
                      setError((e as Error).message);
                    }
                  }
                }}
              >
                {step > 0 ? (
                  <>
                    <ArrowLeft size={15} />
                    Back
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    Save draft
                  </>
                )}
              </Button>
              <span className="draft-saved">
                {saved ? 'Draft saved on this device' : ''}
              </span>
              <Button type="submit" disabled={busy}>
                {step === 2 ? (
                  <>
                    <FileCheck2 size={15} />
                    Submit report
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight size={15} />
                  </>
                )}
              </Button>
            </div>
          </form>
        </>
      )}
    </Modal>
  );
}
