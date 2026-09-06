// Shared logic for resolving which item in a content bank should be shown,
// given its mode (auto / hold / custom) and any per-item date scheduling.
// SCHEDULE always wins when an item's date range covers today, regardless
// of the bank's mode — this matches the spec: "Manual teacher selection
// always overrides automation," and a scheduled item is a deliberate
// teacher choice for that date.

export function todayISO(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function isWithinSchedule(schedule, date = new Date()) {
  if (!schedule || !schedule.start || !schedule.end) return false;
  const t = todayISO(date);
  return t >= schedule.start && t <= schedule.end;
}

export function dayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date - start) / 86400000);
}

/**
 * Resolves the active item for a bank shaped like:
 * { mode: 'auto'|'hold'|'custom', heldId, customValue, items: [...] }
 * Items may optionally carry a `schedule: { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' }`
 * and an `archived: true` flag — archived items are excluded everywhere here
 * (schedule, hold, and auto rotation) but stay in storage so Admin can restore them.
 */
export function resolveActive(bank, date = new Date()) {
  if (!bank) return null;
  const items = (bank.items || []).filter((i) => !i.archived);

  const scheduled = items.find((i) => isWithinSchedule(i.schedule, date));
  if (scheduled) return scheduled;

  if (bank.mode === 'custom' && bank.customValue) {
    return { id: '__custom__', ...bank.customValue };
  }

  if (bank.mode === 'hold' && bank.heldId) {
    const held = items.find((i) => i.id === bank.heldId);
    if (held) return held;
  }

  if (items.length === 0) return null;
  // AUTO: deterministic day-based rotation so it's stable all day and
  // changes automatically at midnight without needing a running process.
  const idx = dayOfYear(date) % items.length;
  return items[idx];
}

/** Same idea, but for the Statement of Inquiry, which uses activeId rather
 * than auto-rotation (it's meant to be a stable yearlong anchor unless
 * Grace schedules an alternate or manually switches it). */
export function resolveActiveSOI(soiBank, date = new Date()) {
  if (!soiBank) return null;
  const items = (soiBank.items || []).filter((i) => !i.archived);
  const scheduled = items.find((i) => isWithinSchedule(i.schedule, date));
  if (scheduled) return scheduled;
  return items.find((i) => i.id === soiBank.activeId) || items[0] || null;
}

/** Returns the field set for a given language, falling back to English
 * when a Spanish translation doesn't exist or hasn't been approved. */
export function localize(item, field, language) {
  if (!item) return '';
  if (language === 'es' && item.es && item.es.approved && item.es[field]) {
    return item.es[field];
  }
  return item[field] || '';
}

/** Advances a bank to the next item after whatever is currently active,
 * pinning it there (mode: 'hold') so manual taps behave predictably —
 * the same "hold" state Admin Mode uses, just driven from the display.
 * Wraps back to the first item after the last. Skips archived items.
 * Returns the same bank unchanged if it has no active items to cycle through. */
export function advanceToNext(bank, date = new Date()) {
  const items = (bank?.items || []).filter((i) => !i.archived);
  if (items.length === 0) return bank;
  const active = resolveActive(bank, date);
  const currentIndex = active ? items.findIndex((i) => i.id === active.id) : -1;
  const nextIndex = (currentIndex + 1) % items.length;
  return { ...bank, mode: 'hold', heldId: items[nextIndex].id };
}

/** Same idea, for the Statement of Inquiry's activeId model. */
export function advanceSOI(soiBank) {
  const items = (soiBank?.items || []).filter((i) => !i.archived);
  if (items.length === 0) return soiBank;
  const currentIndex = items.findIndex((i) => i.id === soiBank.activeId);
  const nextIndex = (currentIndex + 1) % items.length;
  return { ...soiBank, activeId: items[nextIndex].id };
}
