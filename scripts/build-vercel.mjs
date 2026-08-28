import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { verifyStaticExport } from './verify-static-export.mjs';

const root = new URL('../', import.meta.url);
const result = spawnSync(
  process.execPath,
  [fileURLToPath(new URL('node_modules/vinext/dist/cli.js', root)), 'build'],
  {
    cwd: fileURLToPath(root),
    stdio: 'inherit',
    env: {
      ...process.env,
      LOUFIND_BUILD_TARGET: 'vercel',
      PUBLIC_SITE_URL:
        process.env.PUBLIC_SITE_URL || 'https://loufind.vercel.app',
    },
  },
);

if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

const assets = await verifyStaticExport(new URL('dist/client/', root));
console.log(`Verified Vercel homepage and ${assets.length} local assets.`);
