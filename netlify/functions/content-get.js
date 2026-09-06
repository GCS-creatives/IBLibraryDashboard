import { getStore } from '@netlify/blobs';
import { defaultContent } from '../../src/data/defaults.js';

export default async (req) => {
  const url = new URL(req.url);
  const bank = url.searchParams.get('bank');

  if (!bank) {
    return new Response(JSON.stringify({ error: 'Missing bank parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (bank === '__ping') {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const store = getStore('paisley-ib-content');
    const raw = await store.get(bank, { type: 'json' });
    const value = raw ?? defaultContent[bank] ?? null;
    return new Response(JSON.stringify({ value }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
