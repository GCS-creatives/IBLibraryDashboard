import { createHmac, timingSafeEqual } from 'node:crypto';

const SESSION_LENGTH_MS = 1000 * 60 * 60 * 8; // 8 hours — a school day

function getSecret() {
  // Set SESSION_SECRET in Netlify's env vars for best security.
  // Falls back to ADMIN_PIN so the app still works with just one env var set.
  return process.env.SESSION_SECRET || process.env.ADMIN_PIN || 'change-me';
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

  const adminPin = process.env.ADMIN_PIN;
  if (!adminPin) {
    return new Response(
      JSON.stringify({ error: 'ADMIN_PIN is not configured on the server.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const suppliedPin = String(body.pin || '');
  const a = Buffer.from(suppliedPin.padEnd(adminPin.length, ' '));
  const b = Buffer.from(adminPin.padEnd(adminPin.length, ' '));
  const matches = a.length === b.length && timingSafeEqual(a, b) && suppliedPin === adminPin;

  if (!matches) {
    return new Response(JSON.stringify({ ok: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const token = sign({ exp: Date.now() + SESSION_LENGTH_MS });
  return new Response(JSON.stringify({ ok: true, token }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
