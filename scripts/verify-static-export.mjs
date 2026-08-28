import { access, readFile } from 'node:fs/promises';

/** Fail the build when only a Worker bundle or incomplete client assets exist. */
export async function verifyStaticExport(directory) {
  const html = await readFile(new URL('index.html', directory), 'utf8');
  const resources = new Set(['404.html', 'manifest.webmanifest', 'sw.js']);
  let scripts = 0;

  for (const tag of html.matchAll(/<(script|link|img)\b[^>]*>/gi)) {
    const attribute = tag[0].match(/\b(?:src|href)="([^"]+)"/i);
    if (!attribute) continue;
    const resource = new URL(attribute[1], 'https://static-export.local/');
    if (resource.origin !== 'https://static-export.local') continue;
    resources.add(decodeURIComponent(resource.pathname).replace(/^\//, ''));
    if (tag[1].toLowerCase() === 'script') scripts += 1;
  }

  if (!html.includes('LouFind') || scripts === 0) {
    throw new Error(
      'Vercel export is missing the LouFind page or client scripts.',
    );
  }

  for (const resource of resources) {
    try {
      await access(new URL(resource, directory));
    } catch {
      throw new Error(`Vercel export is missing a required asset: ${resource}`);
    }
  }
  return [...resources];
}
