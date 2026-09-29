const fallbackWindow = {
  navigator: { userAgent: 'server', language: 'en-US', hardwareConcurrency: 4 },
  screen: { width: 1440, height: 900, colorDepth: 24 },
};

function safeWindow() {
  return typeof window === 'undefined' ? fallbackWindow : window;
}

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

export function getDeviceFingerprint() {
  const win = safeWindow();
  const parts = [
    win.navigator.userAgent,
    win.navigator.language,
    win.navigator.hardwareConcurrency,
    win.screen.width,
    win.screen.height,
    win.screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ];
  return `ns-${hashString(parts.join('|'))}`;
}

export function getDeviceProfile() {
  const win = safeWindow();
  const userAgent = win.navigator.userAgent || '';
  const platform = /Windows/i.test(userAgent)
    ? 'Windows workstation'
    : /Mac/i.test(userAgent)
      ? 'macOS device'
      : /Android/i.test(userAgent)
        ? 'Android device'
        : /iPhone|iPad/i.test(userAgent)
          ? 'iOS device'
          : 'Trusted browser';

  return {
    fingerprint: getDeviceFingerprint(),
    platform,
    browser: userAgent.includes('Edg')
      ? 'Microsoft Edge'
      : userAgent.includes('Chrome')
        ? 'Chrome'
        : userAgent.includes('Firefox')
          ? 'Firefox'
          : 'Secure browser',
    screen: `${win.screen.width} x ${win.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}
