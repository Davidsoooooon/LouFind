import { networkInterfaces } from 'node:os';
import { spawn } from 'node:child_process';
import { access, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';

const mobile = fileURLToPath(new URL('../mobile/', import.meta.url));
const expoCli = fileURLToPath(
  new URL('../mobile/node_modules/expo/bin/cli', import.meta.url),
);
const entries = Object.entries(networkInterfaces()).flatMap(
  ([name, addresses]) =>
    (addresses || [])
      .filter((address) => address.family === 'IPv4' && !address.internal)
      .map((address) => ({ name, address: address.address })),
);
const privateAddress = (address) =>
  /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(address);
const selected = process.env.LOUFIND_HOST
  ? entries.find((entry) => entry.address === process.env.LOUFIND_HOST)
  : entries.find(
      (entry) => entry.name === 'en0' && privateAddress(entry.address),
    ) || entries.find((entry) => privateAddress(entry.address));
if (!selected || !privateAddress(selected.address)) {
  console.error(
    'Connect this Mac to a private Wi-Fi network, then run npm run phone again.',
  );
  process.exit(1);
}
const host = selected.address;
const webUrl = `http://${host}:3000`;
const expoUrl = `exp://${host}:8081`;
try {
  await access(expoCli);
} catch {
  console.error('Install the phone project first: npm --prefix mobile install');
  process.exit(1);
}
try {
  const response = await fetch(webUrl, { signal: AbortSignal.timeout(8000) });
  if (!response.ok || !(await response.text()).includes('LouFind'))
    throw new Error('Not ready');
} catch {
  console.error(
    'Start LouFind in another terminal with npm run dev:lan, then run npm run phone again.',
  );
  process.exit(1);
}
await mkdir(new URL('../outputs/', import.meta.url), { recursive: true });
const qrPath = fileURLToPath(
  new URL('../outputs/loufind-expo-qr.png', import.meta.url),
);
await QRCode.toFile(qrPath, expoUrl, {
  width: 420,
  margin: 4,
  errorCorrectionLevel: 'M',
  color: { dark: '#073779', light: '#ffffff' },
});
await writeFile(
  new URL('../outputs/loufind-phone.json', import.meta.url),
  JSON.stringify(
    { webUrl, expoUrl, sdk: 54, qrPath, generatedAt: new Date().toISOString() },
    null,
    2,
  ) + '\n',
);
console.log(`LouFind phone preview: ${webUrl}`);
console.log(`Expo Go (SDK 54): ${expoUrl}`);
console.log(`QR image: ${qrPath}`);
console.log(
  'Use the same private Wi-Fi on your iPhone and Mac. Keep both terminals running.',
);
console.log(
  'Local demo only. Data is separate on each device; do not enter real credentials or documents.',
);
const child = spawn(
  process.execPath,
  [expoCli, 'start', '--go', '--lan', '--port', '8081'],
  {
    cwd: mobile,
    env: {
      ...process.env,
      REACT_NATIVE_PACKAGER_HOSTNAME: host,
      EXPO_PUBLIC_LOUFIND_URL: webUrl,
      EXPO_NO_TELEMETRY: '1',
      // SDK 54's file watcher is incompatible with the patched Metro change-event format.
      // Supported CI mode keeps this preview stable; restart after changing native files.
      CI: '1',
    },
    stdio: 'inherit',
  },
);
child.on('error', (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
child.on('exit', (code) => {
  process.exitCode = code || 0;
});
process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));
