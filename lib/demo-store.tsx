/* oxlint-disable react/react-compiler -- Hydrate this explicitly device-local store after mount to avoid SSR mismatch. */
'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createSeed } from './seed';
import { migrateCampusIdentity } from './services/campus-identity';
import type { DemoState } from './types';
// Keep the legacy key so the LouFind rename preserves existing device-local data.
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
        const migrated = migrateCampusIdentity(parsed);
        current.current = migrated;
        setState(migrated);
        if (migrated !== parsed) {
          try {
            localStorage.setItem(KEY, JSON.stringify(migrated));
          } catch {
            setError(
              'Your saved data is loaded, but the campus update could not be saved. Free browser storage before making changes.',
            );
          }
        }
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
