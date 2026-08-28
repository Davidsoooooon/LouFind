'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="app-loading">
      <h1>Let’s try that again.</h1>
      <p>
        Something interrupted your campus noticeboard. Your saved data is still
        on this device.
      </p>
      <button onClick={reset}>Reload the noticeboard</button>
    </main>
  );
}
