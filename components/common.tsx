/* oxlint-disable next/no-img-element -- Locally optimized assets and browser-only upload previews. */
'use client';
import { ImagePlus, PackageSearch, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
export function Modal({
  title,
  description,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className={`app-modal ${wide ? 'wide-modal' : ''}`}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
export function ViewHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow || 'LOUFIND'}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}
export function EmptyState({
  title = 'Nothing here just yet',
  description,
  children,
}: {
  title?: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <PackageSearch size={36} strokeWidth={1.3} />
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  );
}
export function Field({
  label,
  error,
  hint,
  children,
  htmlFor,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="form-field">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && <p className="field-hint">{hint}</p>}
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
export function PhotoUpload({
  value,
  onChange,
  label = 'Item photo',
  onBusy,
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  onBusy?: (value: boolean) => void;
}) {
  const [error, setError] = useState(''),
    [loading, setLoading] = useState(false);
  async function read(file: File) {
    setError('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Choose a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('Choose a photo smaller than 8 MB.');
      return;
    }
    setLoading(true);
    onBusy?.(true);
    try {
      const url = URL.createObjectURL(file);
      try {
        const photo = new Image();
        photo.src = url;
        await photo.decode();
        const scale = Math.min(1, 900 / Math.max(photo.width, photo.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(photo.width * scale);
        canvas.height = Math.round(photo.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error();
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(photo, 0, 0, canvas.width, canvas.height);
        onChange(canvas.toDataURL('image/jpeg', 0.76));
      } finally {
        URL.revokeObjectURL(url);
      }
    } catch {
      setError('This image could not be opened. Please choose another photo.');
    } finally {
      setLoading(false);
      onBusy?.(false);
    }
  }
  return (
    <div className="photo-upload">
      {value ? (
        <div className="upload-preview">
          <img src={value} alt={`${label} preview`} />
          <Button variant="outline" onClick={() => onChange('')} type="button">
            <Trash2 size={14} />
            Remove photo
          </Button>
        </div>
      ) : (
        <label className="upload-area">
          <ImagePlus size={29} strokeWidth={1.4} />
          <strong>
            {loading ? 'Preparing photo…' : `Add ${label.toLowerCase()}`}
          </strong>
          <span>JPG, PNG or WebP · Up to 8 MB</span>
          <span className="upload-action">
            <Upload size={13} />
            Choose a photo
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            aria-label={label}
            disabled={loading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void read(file);
            }}
          />
        </label>
      )}
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
