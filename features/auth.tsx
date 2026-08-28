'use client';
import { useState } from 'react';
import {
  ArrowRight,
  GraduationCap,
  LockKeyhole,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Field } from '@/components/common';
import { authSchema, registrationSchema } from '@/lib/schemas';
import { hashPassword, useDemo } from '@/lib/demo-store';
import { PROFILES } from '@/lib/seed';
import type { Role } from '@/lib/types';
export function AuthView() {
  const { state, transact } = useDemo();
  const [mode, setMode] = useState('login'),
    [email, setEmail] = useState(''),
    [password, setPassword] = useState(''),
    [name, setName] = useState(''),
    [schoolId, setSchoolId] = useState(''),
    [role, setRole] = useState<Role>('student'),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  async function submit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const values = {
      email: email.toLowerCase(),
      password,
      name,
      schoolId,
      role,
    };
    const result = (
      mode === 'login' ? authSchema : registrationSchema
    ).safeParse(values);
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setBusy(true);
    try {
      if (mode === 'login') {
        const profile = state.profiles.find(
          (p) => p.email.toLowerCase() === email.trim().toLowerCase(),
        );
        if (!profile)
          throw new Error(
            'Email or password is incorrect. Try a labeled demo account below.',
          );
        const valid =
          profile.passwordHash && profile.salt
            ? (await hashPassword(password, profile.salt)) ===
              profile.passwordHash
            : password === 'Campus123!';
        if (!valid) throw new Error('Email or password is incorrect.');
        transact((s) => ({ ...s, currentUserId: profile.id }));
      } else {
        if (
          state.profiles.some(
            (p) =>
              p.email.toLowerCase() === email.trim().toLowerCase() ||
              p.schoolId === schoolId.trim(),
          )
        )
          throw new Error(
            'This school email or ID already has a demo account.',
          );
        const salt = crypto.randomUUID(),
          passwordHash = await hashPassword(password, salt),
          id = crypto.randomUUID();
        transact((s) => ({
          ...s,
          profiles: [
            ...s.profiles,
            {
              id,
              name: name.trim(),
              email: email.trim().toLowerCase(),
              schoolId: schoolId.trim(),
              role: role === 'staff' ? 'staff' : 'student',
              salt,
              passwordHash,
            },
          ],
          currentUserId: id,
        }));
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-page">
      <div className="auth-story">
        <div className="brand">
          <span className="brand-mark">
            <MapPin size={27} />
          </span>
          <span>
            FindIt<span className="brand-campus">CAMPUS</span>
          </span>
        </div>
        <div>
          <span className="eyebrow">WESTBRIDGE UNIVERSITY · DEMO CAMPUS</span>
          <h1>
            Things get lost.
            <br />
            Let’s bring them home.
          </h1>
          <p>
            A campus community that looks out for each other, one found item at
            a time.
          </p>
          <div className="auth-assurance">
            <ShieldCheck size={22} />
            <span>
              Private claims. Verified owners.
              <br />
              Safer, happier reunions.
            </span>
          </div>
        </div>
        <small>Local prototype · Sample accounts and data</small>
      </div>
      <div className="auth-form">
        <div className="auth-form-inner">
          <GraduationCap size={30} strokeWidth={1.4} />
          <h2>{mode === 'login' ? 'Welcome back.' : 'Join your campus.'}</h2>
          <p>
            {mode === 'login'
              ? 'Your lost-and-found noticeboard is right here.'
              : 'Create a demo account to report and find items.'}
          </p>
          <div className="tabs">
            <button
              className={mode === 'login' ? 'active' : ''}
              onClick={() => {
                setMode('login');
                setError('');
              }}
            >
              Sign in
            </button>
            <button
              className={mode === 'register' ? 'active' : ''}
              onClick={() => {
                setMode('register');
                setError('');
              }}
            >
              Create account
            </button>
          </div>
          <form onSubmit={submit}>
            {mode === 'register' && (
              <>
                <Field label="Full name" htmlFor="auth-name">
                  <Input
                    id="auth-name"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </Field>
                <div className="form-grid">
                  <Field label="School ID number" htmlFor="auth-id">
                    <Input
                      id="auth-id"
                      value={schoolId}
                      onChange={(e) => setSchoolId(e.target.value)}
                      required
                      placeholder="2026-01234"
                    />
                  </Field>
                  <Field label="Role" htmlFor="auth-role">
                    <NativeSelect
                      id="auth-role"
                      value={role}
                      onChange={(e) => setRole(e.target.value as Role)}
                    >
                      <option value="student">Student</option>
                      <option value="staff">Staff</option>
                    </NativeSelect>
                  </Field>
                </div>
              </>
            )}
            <Field label="School email" htmlFor="auth-email">
              <Input
                id="auth-email"
                autoComplete="email"
                type="email"
                placeholder="you@westbridge.edu.ph"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>
            <Field label="Password" htmlFor="auth-password">
              <Input
                id="auth-password"
                autoComplete={
                  mode === 'register' ? 'new-password' : 'current-password'
                }
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Field>
            {error && (
              <p className="error-note" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="full-width" disabled={busy}>
              {busy
                ? 'One moment…'
                : mode === 'login'
                  ? 'Sign in'
                  : 'Create demo account'}
              <ArrowRight size={15} />
            </Button>
          </form>
          <div className="demo-accounts">
            <span className="eyebrow">JUST EXPLORING? USE A DEMO ACCOUNT</span>
            {PROFILES.filter((p) => p.id !== 'mika').map((p) => (
              <button
                key={p.id}
                onClick={() => transact((s) => ({ ...s, currentUserId: p.id }))}
              >
                <span>
                  <strong>
                    {p.role === 'security'
                      ? 'Campus security'
                      : p.role === 'staff'
                        ? 'Faculty & staff'
                        : 'Student'}
                  </strong>
                  <small>{p.email}</small>
                </span>
                <ArrowRight size={16} />
              </button>
            ))}
            <p>
              All sample accounts use <strong>Campus123!</strong>
            </p>
          </div>
          <div className="privacy-line">
            <LockKeyhole size={15} />
            <span>
              This is a local demo, not school authentication. Use a test
              password. Nothing is shared across devices.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
