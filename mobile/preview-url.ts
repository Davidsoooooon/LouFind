function isLocalHost(host: string) {
  return (
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    host.endsWith('.local')
  );
}

export function resolvePreviewUrl(configured?: string, metroHost?: string) {
  try {
    const url = configured
      ? new URL(configured)
      : new URL(`http://${metroHost || ''}`);
    if (!configured) url.port = '3000';
    if (url.username || url.password) return null;
    if (
      url.protocol !== 'https:' &&
      !(url.protocol === 'http:' && isLocalHost(url.hostname))
    )
      return null;
    if (!url.hash) url.hash = 'home';
    return url.href;
  } catch {
    return null;
  }
}

export function isInternalNavigation(destination: string, source: string) {
  if (destination === 'about:blank') return true;
  try {
    return new URL(destination).origin === new URL(source).origin;
  } catch {
    return false;
  }
}
