import { LouFindLogo } from './loufind-logo';
import { CAMPUS } from '@/lib/campus';

export function AppLoading() {
  return (
    <main
      className="startup-screen"
      aria-label="LouFind loading"
      aria-busy="true"
    >
      <div className="startup-content">
        <div className="startup-logo">
          <LouFindLogo full />
        </div>
        <div className="startup-status">
          <div className="startup-progress" aria-hidden="true">
            <span />
          </div>
          <output aria-live="polite">
            Opening your campus lost &amp; found…
          </output>
        </div>
        <noscript>Please enable JavaScript to open LouFind.</noscript>
      </div>
      <footer className="startup-campus">
        <strong>{CAMPUS.name}</strong>
        <span>{CAMPUS.location}</span>
      </footer>
    </main>
  );
}
