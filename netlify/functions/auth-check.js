import { createHmac, timingSafeEqual } from 'node:crypto';
import { getStore } from '@netlify/blobs';

const SESSION_LENGTH_MS = 1000 * 60 * 60 * 8; // 8 hours — a school day
export const DEFAULT_PIN = '0000';

function getSecret() {
  // Set SESSION_SECRET in Netlify's env vars for best security. Falls back
  // to a static string — this only signs sessions, it never gates login by
  // itself, so a missing env var doesn't block Grace from getting in.
  return process.env.SESSION_SECRET || 'paisley-ib-library-static-fallback-secret';
}

function sign(payload) {
  const json = JSON.stringify(payload);
  const b64 = Buffer.from(json).toString('base64url');
  const hmac = createHmac('sha256', getSecret()).update(b64).digest('base64url');
  return `${b64}.${hmac}`;
}

export function verifySessionToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return false;
  const [b64, hmac] = token.split('.');
  const expected = createHmac('sha256', getSecret()).update(b64).digest('base64url');

  const a = Buffer.from(hmac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  try {
    const payload = JSON.parse(Buffer.from(b64, 'base64url').toString('utf8'));
    return typeof payload.exp === 'number' && Date.now() < payload.exp;
  } catch {
    return false;
  }
}

export function issueSessionToken() {
  return sign({ exp: Date.now() + SESSION_LENGTH_MS });
}

/** Reads the current PIN from Blobs. Returns the default ('0000') if
 * Grace hasn't changed it yet — this is what makes 0000 work out of the
 * box on a brand-new deploy with no setup required. */
export async function getCurrentPin() {
  try {
    const store = getStore('paisley-ib-auth');
    const stored = await store.get('pin', { type: 'text' });
    return stored || DEFAULT_PIN;
  } catch {
    return DEFAULT_PIN;
  }
}

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 });
  }

  const currentPin = await getCurrentPin();
  const suppliedPin = String(body.pin || '');

  const a = Buffer.from(suppliedPin.padEnd(currentPin.length, ' '));
  const b = Buffer.from(currentPin.padEnd(currentPin.length, ' '));
  const matches = a.length === b.length && timingSafeEqual(a, b) && suppliedPin === currentPin;

  if (!matches) {
    return new Response(JSON.stringify({ ok: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ ok: true, token: issueSessionToken() }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
