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

  // Load every content bank on first mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const loaded = {};
      for (const name of BANK_NAMES) {
        try {
          loaded[name] = await getBank(name);
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
    return <div style={{ padding: 40, color: '#10294A' }}>Loading Paisley IB Library…</div>;
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
