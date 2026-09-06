import { defaultContent } from '../data/defaults.js';

// In-memory fallback store used only when the Netlify functions aren't
// reachable (e.g. running `npm run dev` locally without `netlify dev`).
// This is intentionally NOT localStorage — it resets on page reload,
// which is fine for local UI iteration. Once deployed to Netlify, every
// read/write goes through the real functions backed by Netlify Blobs.
const memoryStore = structuredClone(defaultContent);

let useMock = null; // null = unknown yet, true/false once detected

async function detectBackend() {
  if (useMock !== null) return useMock;
  try {
    const res = await fetch('/api/content-get?bank=__ping', { method: 'GET' });
    // Any response (even a 4xx from a real function) means functions are live.
    useMock = !res || res.status === 404 && res.headers.get('x-served-by') == null ? false : false;
    // If fetch didn't throw, assume functions exist.
    useMock = false;
  } catch (err) {
    useMock = true;
  }
  return useMock;
}

export async function getBank(bankName) {
  const mock = await detectBackend();
  if (mock) {
    return memoryStore[bankName];
  }
  const res = await fetch(`/api/content-get?bank=${encodeURIComponent(bankName)}`);
  if (!res.ok) throw new Error(`Failed to load ${bankName}`);
  const data = await res.json();
  return data.value ?? defaultContent[bankName];
}

export async function setBank(bankName, value, sessionToken) {
  const mock = await detectBackend();
  if (mock) {
    memoryStore[bankName] = value;
    return { ok: true, mock: true };
  }
  const res = await fetch('/api/content-set', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionToken || ''}`
    },
    body: JSON.stringify({ bank: bankName, value })
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error('unauthorized');
    throw new Error(`Failed to save ${bankName}`);
  }
  return res.json();
}

// Mock-mode PIN, changeable locally so the "change PIN" flow can be tested
// without deploying. Resets to '0000' on page reload, same as content banks.
let mockPin = '0000';

export async function checkPin(pin) {
  const mock = await detectBackend();
  if (mock) {
    // Local dev fallback so Admin Mode is reachable without deploying.
    // Real deployments check the PIN stored in Netlify Blobs (defaults to
    // '0000' until Grace changes it in Admin Mode).
    return pin === mockPin ? { ok: true, token: 'mock-session' } : { ok: false };
  }
  const res = await fetch('/api/auth-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin })
  });
  if (!res.ok) return { ok: false };
  return res.json();
}

export async function changePin(newPin, sessionToken) {
  const mock = await detectBackend();
  if (mock) {
    mockPin = newPin;
    return { ok: true, mock: true };
  }
  const res = await fetch('/api/change-pin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionToken || ''}`
    },
    body: JSON.stringify({ newPin })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to change PIN');
  }
  return res.json();
}

export function isMockBackend() {
  return useMock === true;
}
