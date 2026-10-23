const assert = require('node:assert/strict');

// Keep this parser contract in sync with game.connect(). It covers the two
// Android-only failures that previously happened before WebSocket was created:
// old WebViews without URL.canParse and bare IPv6 host syntax.
function buildUrl(ip, secure = false) {
  const protocol = secure ? 'wss://' : 'ws://';
  const canParseUrl = value => {
    try { new URL(value); return true; } catch { return false; }
  };
  const hasWebSocketScheme = /^(?:ws|wss):\/\//i.test(ip.trim());
  if (hasWebSocketScheme && canParseUrl(ip)) return new URL(ip).href;
  const ipv4 = /^(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6 = /^[0-9a-f:]+$/i;
  let host = ip.trim();
  if (ipv6.test(host) && host.includes(':') && !host.startsWith('[')) host = `[${host}]`;
  const url = new URL(`${protocol}${host}`);
  if (ipv4.test(ip) || ipv6.test(ip)) url.port = '8080';
  else if (url.pathname === '/') url.port = '8080';
  return url.href;
}

const savedCanParse = URL.canParse;
try {
  URL.canParse = undefined;
  assert.equal(buildUrl('127.0.0.1:8080'), 'ws://127.0.0.1:8080/');
  assert.equal(buildUrl('2001:db8::1'), 'ws://[2001:db8::1]:8080/');
  assert.equal(buildUrl('ws://example.test:18080/path'), 'ws://example.test:18080/path');
  console.log('ANDROID_CONNECT_REGRESSION_PASS');
} finally {
  URL.canParse = savedCanParse;
}
