import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { test } from 'node:test';
import { verifyStaticExport } from '../scripts/verify-static-export.mjs';

async function fixture(t: { after: (fn: () => Promise<void>) => void }) {
  const directory = await mkdtemp(join(tmpdir(), 'loufind-export-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const url = pathToFileURL(`${directory}/`);
  await mkdir(new URL('assets/', url));
  for (const file of [
    '404.html',
    'manifest.webmanifest',
    'sw.js',
    'assets/app.js',
  ]) {
    await writeFile(new URL(file, url), 'fixture');
  }
  return url;
}

void test('static export includes its homepage and referenced client assets', async (t) => {
  const directory = await fixture(t);
  await writeFile(
    new URL('index.html', directory),
    '<!doctype html><title>LouFind</title><script src="/assets/app.js"></script>',
  );
  assert.ok((await verifyStaticExport(directory)).includes('assets/app.js'));
});

void test('a Worker-only build cannot pass as a Vercel static export', async (t) => {
  const directory = await fixture(t);
  await assert.rejects(verifyStaticExport(directory), { code: 'ENOENT' });
});

void test('a homepage with a missing JavaScript bundle fails verification', async (t) => {
  const directory = await fixture(t);
  await writeFile(
    new URL('index.html', directory),
    '<title>LouFind</title><script src="/assets/missing.js"></script>',
  );
  await assert.rejects(
    verifyStaticExport(directory),
    /missing a required asset: assets\/missing.js/,
  );
});

void test('an error page without the app cannot pass verification', async (t) => {
  const directory = await fixture(t);
  await writeFile(
    new URL('index.html', directory),
    '<title>404: NOT_FOUND</title>',
  );
  await assert.rejects(
    verifyStaticExport(directory),
    /missing the LouFind page or client scripts/,
  );
});
