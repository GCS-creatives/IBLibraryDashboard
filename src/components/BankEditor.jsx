import React, { useState } from 'react';

function ModePills({ mode, onChange }) {
  const options = ['auto', 'hold', 'custom'];
  return (
    <div className="mode-pills">
      {options.map((o) => (
        <button
          key={o}
          className={`mode-pill${mode === o ? ' active' : ''}`}
          onClick={() => onChange(o)}
          title={
            o === 'auto' ? 'Rotates automatically, one per day' :
            o === 'hold' ? 'Freeze on one saved item until released' :
            'Type something temporary right now'
          }
        >
          {o.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function FieldInputs({ fields, values, onChange, prefix = '' }) {
  return (
    <>
      {fields.map((f) => (
        <div key={f.key}>
          <label style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>{prefix}{f.label}</label>
          {f.type === 'textarea' ? (
            <textarea
              rows={f.rows || 2}
              value={values[f.key] || ''}
              onChange={(e) => onChange(f.key, e.target.value)}
            />
          ) : f.type === 'select' ? (
            <select value={values[f.key] || ''} onChange={(e) => onChange(f.key, e.target.value)}>
              {f.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          ) : (
            <input
              type="text"
              value={values[f.key] || ''}
              onChange={(e) => onChange(f.key, e.target.value)}
            />
          )}
        </div>
      ))}
    </>
  );
}

function ItemRow({ item, fields, spanishEnabled, isHeld, onHold, onUpdate, onRemove }) {
  const [showSchedule, setShowSchedule] = useState(!!item.schedule);
  const [showTranslate, setShowTranslate] = useState(false);
  const [start, setStart] = useState(item.schedule?.start || '');
  const [end, setEnd] = useState(item.schedule?.end || '');
  const [esDraft, setEsDraft] = useState(item.es || {});

  const saveSchedule = () => {
    onUpdate(item.id, { schedule: start && end ? { start, end } : null });
  };

  const saveTranslation = () => {
    const hasAny = fields.some((f) => (esDraft[f.key] || '').trim());
    onUpdate(item.id, { es: { ...esDraft, approved: hasAny } });
  };

  const summary = fields.map((f) => item[f.key]).filter(Boolean).join(' — ');

  return (
    <div style={{ borderBottom: '1px solid #DCE3E0', paddingBottom: 8, marginBottom: 8 }}>
      <div className="row" style={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <label style={{ display: 'flex', gap: 6, alignItems: 'flex-start', fontSize: '0.85rem' }}>
          <input type="radio" checked={isHeld} onChange={() => onHold(item.id)} style={{ marginTop: 3 }} />
          <span>{summary}</span>
        </label>
        <button className="btn-secondary" style={{ padding: '2px 8px' }} onClick={() => onRemove(item.id)}>Remove</button>
      </div>

      <div className="row" style={{ marginTop: 4 }}>
        <button className="mode-pill" onClick={() => setShowSchedule((s) => !s)}>📅 Schedule</button>
        {spanishEnabled && (
          <button className="mode-pill" onClick={() => setShowTranslate((s) => !s)}>🌐 Español</button>
        )}
        {item.schedule && (
          <span style={{ fontSize: '0.72rem', color: 'var(--green)' }}>
            Scheduled {item.schedule.start} → {item.schedule.end}
          </span>
        )}
      </div>

      {showSchedule && (
        <div className="row" style={{ marginTop: 4 }}>
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          <button className="btn-secondary" style={{ padding: '4px 10px' }} onClick={saveSchedule}>Save Dates</button>
        </div>
      )}

      {showTranslate && (
        <div style={{ marginTop: 6, paddingLeft: 10, borderLeft: '2px solid var(--gold)' }}>
          <FieldInputs
            fields={fields}
            values={esDraft}
            onChange={(key, val) => setEsDraft((d) => ({ ...d, [key]: val }))}
            prefix="ES: "
          />
          <button className="btn-secondary" style={{ padding: '4px 10px' }} onClick={saveTranslation}>
            Save Translation
          </button>
          <p style={{ fontSize: '0.7rem', color: 'var(--ink-soft)', marginTop: 4 }}>
            Saving here marks this translation as approved for the Spanish display toggle.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * bank shape: { mode: 'auto'|'hold'|'custom', heldId, customValue, items: [{id, schedule, es, ...fields}] }
 */
export default function BankEditor({
  title, bank, onSave, fields, idPrefix, spanishEnabled
}) {
  const [newItem, setNewItem] = useState({});
  const [customDraft, setCustomDraft] = useState(bank.customValue || {});

  const setMode = (mode) => onSave({ ...bank, mode });

  const setHeld = (id) => onSave({ ...bank, mode: 'hold', heldId: id });

  const updateItem = (id, patch) => {
    const items = bank.items.map((i) => (i.id === id ? { ...i, ...patch } : i));
    onSave({ ...bank, items });
  };

  const removeItem = (id) => {
    onSave({ ...bank, items: bank.items.filter((i) => i.id !== id) });
  };

  const addItem = () => {
    const hasContent = fields.some((f) => (newItem[f.key] || '').trim());
    if (!hasContent) return;
    const id = `${idPrefix}-${Date.now()}`;
    const esBase = {};
    fields.forEach((f) => { esBase[f.key] = ''; });
    const item = { id, schedule: null, es: { ...esBase, approved: false }, ...newItem };
    onSave({ ...bank, items: [...bank.items, item] });
    setNewItem({});
  };

  const saveCustom = () => onSave({ ...bank, mode: 'custom', customValue: customDraft });

  return (
    <div className="admin-panel">
      <h2>{title}</h2>
      <ModePills mode={bank.mode} onChange={setMode} />

      {bank.mode === 'custom' && (
        <div style={{ marginBottom: 10, padding: 8, background: '#FBF1DD', borderRadius: 8 }}>
          <FieldInputs
            fields={fields}
            values={customDraft}
            onChange={(key, val) => setCustomDraft((d) => ({ ...d, [key]: val }))}
          />
          <button className="btn-primary" onClick={saveCustom}>Show This Now</button>
        </div>
      )}

      {bank.items.map((item) => (
        <ItemRow
          key={item.id}
          item={item}
          fields={fields}
          spanishEnabled={spanishEnabled}
          isHeld={bank.mode === 'hold' && bank.heldId === item.id}
          onHold={setHeld}
          onUpdate={updateItem}
          onRemove={removeItem}
        />
      ))}

      <div style={{ marginTop: 8 }}>
        <FieldInputs
          fields={fields}
          values={newItem}
          onChange={(key, val) => setNewItem((d) => ({ ...d, [key]: val }))}
        />
        <button className="btn-primary" onClick={addItem}>Add to Bank</button>
      </div>
    </div>
  );
}
