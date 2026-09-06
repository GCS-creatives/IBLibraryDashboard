import React, { useEffect, useState, useCallback } from 'react';
import { getBank, setBank } from './lib/blobsClient.js';
import { defaultContent } from './data/defaults.js';
import DisplayMode from './components/Display.jsx';
import AdminMode from './components/Admin.jsx';

const BANK_NAMES = Object.keys(defaultContent);

export default function App() {
  const [banks, setBanks] = useState(null); // null while loading
  const [mode, setMode] = useState('display'); // 'display' | 'admin'
  const [sessionToken, setSessionToken] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Load every content bank on first mount. Each fetched value is merged
  // *under* the current default shape — if a bank's schema has changed
  // since data was last saved (e.g. media went from a single `current`
  // pointer to an `items` list), any keys missing from the stored value
  // fall back to the default instead of being undefined and crashing
  // the first render.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const loaded = {};
      for (const name of BANK_NAMES) {
        try {
          const fetched = await getBank(name);
          const base = defaultContent[name];
          let merged = (base && typeof base === 'object' && !Array.isArray(base) && fetched && typeof fetched === 'object')
            ? { ...base, ...fetched }
            : (fetched ?? base);
          // Extra safety net: if a bank's shape defines an `items` array,
          // never let a stale/malformed stored value replace it with
          // something that isn't an array — that's what every rotation
          // bank component assumes it can .map()/.length on.
          if (base && Array.isArray(base.items) && !Array.isArray(merged?.items)) {
            merged = { ...merged, items: base.items };
          }
          loaded[name] = merged;
        } catch {
          loaded[name] = defaultContent[name];
        }
      }
      if (!cancelled) setBanks(loaded);
    })();
    return () => { cancelled = true; };
  }, []);

  const updateBank = useCallback(async (bankName, nextValue) => {
    setBanks((prev) => ({ ...prev, [bankName]: nextValue }));
    try {
      await setBank(bankName, nextValue, sessionToken);
    } catch (err) {
      // Surface a lightweight console warning; Admin UI can retry.
      console.error(`Failed to persist ${bankName}:`, err.message);
    }
  }, [sessionToken]);

  const enterAdmin = useCallback((token) => {
    setSessionToken(token);
    setMode('admin');
  }, []);

  const exitAdmin = useCallback(() => {
    setMode('display');
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = document.documentElement;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  if (!banks) {
    return <div style={{ padding: 40, color: 'var(--navy)' }}>Loading Paisley IB Library…</div>;
  }

  if (mode === 'admin') {
    return (
      <AdminMode
        banks={banks}
        updateBank={updateBank}
        sessionToken={sessionToken}
        onExit={exitAdmin}
      />
    );
  }

  return (
    <DisplayMode
      banks={banks}
      isFullscreen={isFullscreen}
      onToggleFullscreen={toggleFullscreen}
      onRequestAdmin={enterAdmin}
    />
  );
}
