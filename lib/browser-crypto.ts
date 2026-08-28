/** Secure random IDs also work on an HTTP LAN preview where randomUUID is absent. */
export function createId(
  provider: Pick<Crypto, 'getRandomValues'> &
    Partial<Pick<Crypto, 'randomUUID'>> = crypto,
) {
  if (provider.randomUUID) return provider.randomUUID();
  const bytes = provider.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** Preserve the existing PBKDF2 format when Web Crypto requires a secure origin. */
export async function hashPassword(
  password: string,
  salt: string,
  provider: Partial<Pick<Crypto, 'subtle'>> = crypto,
) {
  const encoder = new TextEncoder();
  let bytes: Uint8Array;
  if (provider.subtle) {
    const key = await provider.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits'],
    );
    const bits = await provider.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: encoder.encode(salt),
        iterations: 100000,
        hash: 'SHA-256',
      },
      key,
      256,
    );
    bytes = new Uint8Array(bits);
  } else {
    const [{ pbkdf2Async }, { sha256 }] = await Promise.all([
      import('@noble/hashes/pbkdf2.js'),
      import('@noble/hashes/sha2.js'),
    ]);
    bytes = await pbkdf2Async(
      sha256,
      encoder.encode(password),
      encoder.encode(salt),
      {
        c: 100000,
        dkLen: 32,
      },
    );
  }
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(
    '',
  );
}
