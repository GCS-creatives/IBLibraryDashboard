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
 * Items may optionally carry a `schedule: { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' }`.
 */
export function resolveActive(bank, date = new Date()) {
  if (!bank) return null;
  const items = bank.items || [];

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
  const items = soiBank.items || [];
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
