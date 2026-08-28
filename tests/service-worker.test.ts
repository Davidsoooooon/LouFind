import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const source = readFileSync(
  new URL('../public/sw.js', import.meta.url),
  'utf8',
);
type Request = { url: string; method: string; mode: string };
type WorkerEvent = {
  request?: Request;
  waitUntil: (promise: Promise<unknown>) => void;
  respondWith: (promise: Promise<unknown>) => void;
};

function worker(offline = false) {
  const handlers = new Map<string, (event: WorkerEvent) => void>();
  const cacheNames = new Set([
    'findit-campus-baguio-v3',
    'loufind-v0',
    'other-app',
  ]);
  const resources = new Map<string, string>();
  const requested: string[] = [];
  runInNewContext(source, {
    URL,
    self: {
      location: { origin: 'https://loufind.example' },
      addEventListener: (name: string, handler: (event: WorkerEvent) => void) =>
        handlers.set(name, handler),
      skipWaiting() {},
      clients: { claim() {} },
    },
    caches: {
      async open(name: string) {
        cacheNames.add(name);
        return {
          async addAll(paths: string[]) {
            paths.forEach((path) => resources.set(path, `cached:${path}`));
          },
        };
      },
      async keys() {
        return [...cacheNames];
      },
      async delete(name: string) {
        return cacheNames.delete(name);
      },
      async match(request: string | Request) {
        const path =
          typeof request === 'string' ? request : new URL(request.url).pathname;
        return resources.get(path);
      },
    },
    async fetch(request: Request) {
      requested.push(request.url);
      if (offline) throw new Error('Offline');
      return `network:${request.url}`;
    },
  });
  function dispatch(name: string, request?: Request) {
    let response: Promise<unknown> = Promise.resolve(undefined);
    let intercepted = false;
    handlers.get(name)?.({
      request,
      waitUntil(promise) {
        response = promise;
      },
      respondWith(promise) {
        response = promise;
        intercepted = true;
      },
    });
    return { response, intercepted };
  }
  return { dispatch, cacheNames, requested };
}

void test('LouFind activation removes legacy app caches while preserving the current and unrelated caches', async () => {
  const { dispatch, cacheNames } = worker();
  await dispatch('install').response;
  await dispatch('activate').response;
  assert.deepEqual([...cacheNames].sort(), ['loufind-v1', 'other-app']);
});

void test('offline navigation and the supplied logo both resolve from the installed cache', async () => {
  const { dispatch, requested } = worker(true);
  await dispatch('install').response;
  const page = {
    url: 'https://loufind.example/',
    method: 'GET',
    mode: 'navigate',
  };
  assert.equal(await dispatch('fetch', page).response, 'cached:/offline.html');
  const logo = {
    ...page,
    url: 'https://loufind.example/brand/loufind-logo.webp',
    mode: 'no-cors',
  };
  assert.equal(
    await dispatch('fetch', logo).response,
    'cached:/brand/loufind-logo.webp',
  );
  assert.deepEqual(requested, [page.url]);
});

void test('online navigation stays fresh and the worker does not intercept writes or external requests', async () => {
  const { dispatch } = worker();
  await dispatch('install').response;
  const page = {
    url: 'https://loufind.example/',
    method: 'GET',
    mode: 'navigate',
  };
  assert.equal(await dispatch('fetch', page).response, `network:${page.url}`);
  assert.equal(
    dispatch('fetch', { ...page, method: 'POST' }).intercepted,
    false,
  );
  assert.equal(
    dispatch('fetch', { ...page, url: 'https://another.example/' }).intercepted,
    false,
  );
});
