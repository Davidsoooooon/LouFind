import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pbkdf2Sync } from 'node:crypto';
import { createId, hashPassword } from '../lib/browser-crypto';
import { isInternalNavigation, resolvePreviewUrl } from '../mobile/preview-url';

void test('LAN previews generate secure UUID v4 IDs without the secure-context randomUUID method', () => {
  const provider = { getRandomValues: crypto.getRandomValues.bind(crypto) };
  const ids = Array.from({ length: 100 }, () => createId(provider));
  assert.equal(new Set(ids).size, 100);
  for (const id of ids)
    assert.match(
      id,
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
});

void test('LAN password hashing matches existing browser PBKDF2 credentials', async () => {
  const password = 'Demo-only-LouFind-ñ-2026!';
  const salt = 'existing-saved-demo-salt';
  const expected = Array.from(
    pbkdf2Sync(password, salt, 100000, 32, 'sha256'),
    (byte) => byte.toString(16).padStart(2, '0'),
  ).join('');
  assert.equal(await hashPassword(password, salt), expected);
  assert.equal(await hashPassword(password, salt, {}), expected);
  assert.notEqual(await hashPassword('wrong-password', salt, {}), expected);
});

void test('mobile preview derives the Mac address instead of pointing to iPhone localhost', () => {
  assert.equal(
    resolvePreviewUrl(undefined, '192.168.0.17:8081'),
    'http://192.168.0.17:3000/#home',
  );
  assert.equal(
    resolvePreviewUrl('http://10.0.0.5:3000/#browse'),
    'http://10.0.0.5:3000/#browse',
  );
  assert.equal(resolvePreviewUrl(undefined, 'localhost:8081'), null);
  assert.equal(resolvePreviewUrl(), null);
});

void test('mobile URL configuration rejects credentials, custom schemes, and public unencrypted hosts', () => {
  assert.equal(
    resolvePreviewUrl('https://loufind.example/'),
    'https://loufind.example/#home',
  );
  for (const invalid of [
    'javascript:alert(1)',
    'file:///tmp/app.html',
    'http://public.example/',
    'https://user:secret@loufind.example/',
  ])
    assert.equal(resolvePreviewUrl(invalid), null);
});

void test('WebView navigation remains in LouFind and rejects lookalike origins', () => {
  const source = 'http://192.168.0.17:3000/#home';
  assert.equal(
    isInternalNavigation('http://192.168.0.17:3000/#browse', source),
    true,
  );
  assert.equal(isInternalNavigation('about:blank', source), true);
  assert.equal(isInternalNavigation('https://www.slu.edu.ph/', source), false);
  assert.equal(
    isInternalNavigation('http://192.168.0.17:3001/', source),
    false,
  );
  assert.equal(isInternalNavigation('javascript:alert(1)', source), false);
});
