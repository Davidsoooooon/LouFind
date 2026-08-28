import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="app-loading">
      <h1>This page is a little lost.</h1>
      <p>Head back to the campus noticeboard.</p>
      <Link href="/">Back to FindIt Campus</Link>
    </main>
  );
}
