/* oxlint-disable react/react-compiler -- Hydrate this explicitly device-local store after mount to avoid SSR mismatch. */
'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createSeed } from './seed';
import type { DemoState } from './types';
const KEY = 'findit-campus-demo-v1';
interface Store {
  state: DemoState;
  ready: boolean;
  error: string;
  transact: (change: (s: DemoState) => DemoState) => void;
  reset: () => void;
}
const Context = createContext<Store | null>(null);
export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(createSeed),
    [ready, setReady] = useState(false),
    [error, setError] = useState('');
  const current = useRef(state);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as DemoState;
        if (
          parsed.version !== 1 ||
          !Array.isArray(parsed.profiles) ||
          !Array.isArray(parsed.reports) ||
          !Array.isArray(parsed.claims) ||
          !Array.isArray(parsed.notifications) ||
          !Array.isArray(parsed.logs) ||
          !parsed.saved
        )
          throw new Error('Invalid local data');
        current.current = parsed;
        setState(parsed);
      }
    } catch {
      setError(
        'Saved demo data could not be loaded. You are viewing the sample data; use Reset demo in your account if needed.',
      );
    }
    setReady(true);
  }, []);
  function transact(change: (s: DemoState) => DemoState) {
    const next = change(current.current);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      setError(
        'Your browser could not save this change. Remove a large photo or free browser storage, then try again.',
      );
      throw new Error(
        'Change not saved: browser storage is full or unavailable.',
      );
    }
    current.current = next;
    setState(next);
    setError('');
  }
  return (
    <Context.Provider
      value={{
        state,
        ready,
        error,
        transact,
        reset: () => transact(() => createSeed()),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useDemo() {
  const value = useContext(Context);
  if (!value) throw new Error('DemoProvider is required');
  return value;
}
export async function hashPassword(password: string, salt: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: new TextEncoder().encode(salt),
      iterations: 100000,
      hash: 'SHA-256',
    },
    key,
    256,
  );
  return Array.from(new Uint8Array(bits))
    .map((n) => n.toString(16).padStart(2, '0'))
    .join('');
}
