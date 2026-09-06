import React, { useState } from 'react';
import BankEditor from './BankEditor.jsx';

function useSaveToast() {
  const [msg, setMsg] = useState(null);
  const fire = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(null), 1800);
  };
  return [msg, fire];
}

function Panel({ title, children }) {
  return (
    <div className="admin-panel">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

/* ---------- Statement of Inquiry ---------- */
function SOIPanel({ bank, spanishEnabled, onSave }) {
  const [draft, setDraft] = useState('');
  const [openSchedule, setOpenSchedule] = useState(null);
  const [openTranslate, setOpenTranslate] = useState(null);
  const [scheduleDraft, setScheduleDraft] = useState({ start: '', end: '' });
  const [esDraft, setEsDraft] = useState('');

  const setActive = (id) => onSave({ ...bank, activeId: id });

  const addCustom = () => {
    if (!draft.trim()) return;
    const id = `soi-${Date.now()}`;
    const items = [...bank.items, {
      id, text: draft.trim(), isDefault: false, status: 'active',
      schedule: null, es: { text: '', approved: false }
    }];
    onSave({ ...bank, items, activeId: id });
    setDraft('');
  };

  const restoreDefault = () => {
    const def = bank.items.find((i) => i.isDefault);
    if (def) setActive(def.id);
  };

  const saveSchedule = (id) => {
    const items = bank.items.map((i) => i.id === id
      ? { ...i, schedule: scheduleDraft.start && scheduleDraft.end ? { ...scheduleDraft } : null }
      : i);
    onSave({ ...bank, items });
    setOpenSchedule(null);
  };

  const saveTranslation = (id) => {
    const items = bank.items.map((i) => i.id === id
      ? { ...i, es: { text: esDraft, approved: !!esDraft.trim() } }
      : i);
    onSave({ ...bank, items });
    setOpenTranslate(null);
  };

  return (
    <Panel title="Statement of Inquiry">
      {bank.items.map((item) => (
        <div key={item.id} style={{ borderBottom: '1px solid #DCE3E0', paddingBottom: 8, marginBottom: 8 }}>
          <div className="row" style={{ alignItems: 'center' }}>
            <input type="radio" checked={bank.activeId === item.id} onChange={() => setActive(item.id)} />
            <span style={{ fontSize: '0.85rem' }}>{item.text}{item.isDefault ? ' (default)' : ''}</span>
          </div>
          <div className="row">
            <button className="mode-pill" onClick={() => { setOpenSchedule(item.id); setScheduleDraft(item.schedule || { start: '', end: '' }); }}>📅 Schedule</button>
            {spanishEnabled && (
              <button className="mode-pill" onClick={() => { setOpenTranslate(item.id); setEsDraft(item.es?.text || ''); }}>🌐 Español</button>
            )}
            {item.schedule && <span style={{ fontSize: '0.72rem', color: '#2E6E4E' }}>Scheduled {item.schedule.start} → {item.schedule.end}</span>}
          </div>
          {openSchedule === item.id && (
            <div className="row" style={{ marginTop: 4 }}>
              <input type="date" value={scheduleDraft.start} onChange={(e) => setScheduleDraft((d) => ({ ...d, start: e.target.value }))} />
              <input type="date" value={scheduleDraft.end} onChange={(e) => setScheduleDraft((d) => ({ ...d, end: e.target.value }))} />
              <button className="btn-secondary" onClick={() => saveSchedule(item.id)}>Save Dates</button>
            </div>
          )}
          {openTranslate === item.id && (
            <div style={{ marginTop: 6, paddingLeft: 10, borderLeft: '2px solid #C9992E' }}>
              <textarea rows={2} value={esDraft} onChange={(e) => setEsDraft(e.target.value)} />
              <button className="btn-secondary" onClick={() => saveTranslation(item.id)}>Save Translation</button>
            </div>
          )}
        </div>
      ))}
      <textarea
        rows={2}
        placeholder="Write a new Statement of Inquiry…"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
      />
      <div className="row">
        <button className="btn-primary" onClick={addCustom}>Add &amp; Activate</button>
        <button className="btn-secondary" onClick={restoreDefault}>Restore Default</button>
      </div>
    </Panel>
  );
}

/* ---------- Voice Level ---------- */
function VoicePanel({ bank, onSave }) {
  return (
    <Panel title="Voice Level">
      <div className="row" style={{ flexWrap: 'wrap' }}>
        {bank.levels.filter((l) => !l.disabled).map((l) => (
          <button
            key={l.level}
            className={bank.current === l.level ? 'btn-primary' : 'btn-secondary'}
            onClick={() => onSave({ ...bank, current: l.level })}
          >
            {l.level} — {l.label}
          </button>
        ))}
      </div>
      <p style={{ fontSize: '0.75rem', color: '#4A5A6B' }}>
        Level 3 (Outside Voice) is defined but intentionally not selectable here.
      </p>
    </Panel>
  );
}

/* ---------- Media ---------- */
function MediaPanel({ bank, onSave }) {
  const current = bank.current || { type: 'iframe', url: '', title: '' };
  const [type, setType] = useState(current.type);
  const [url, setUrl] = useState(current.url);
  const [title, setTitle] = useState(current.title);

  const save = () => onSave({ ...bank, current: url ? { type, url, title } : null });
  const clear = () => { setUrl(''); setTitle(''); onSave({ ...bank, current: null }); };

  return (
    <Panel title="Library Learning Space Media">
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="iframe">Website / Google Slides / Canva (embed URL)</option>
        <option value="image">Image</option>
      </select>
      <input type="text" placeholder="URL" value={url} onChange={(e) => setUrl(e.target.value)} />
      <input type="text" placeholder="Title / caption" value={title} onChange={(e) => setTitle(e.target.value)} />
      <div className="row">
        <button className="btn-primary" onClick={save}>Save Media</button>
        <button className="btn-secondary" onClick={clear}>Clear</button>
      </div>
      <p style={{ fontSize: '0.75rem', color: '#4A5A6B' }}>
        For YouTube, use the embed URL form: https://www.youtube.com/embed/VIDEO_ID
      </p>
    </Panel>
  );
}

/* ---------- Generic string-list editor (Rules / Space rules), with optional Spanish ---------- */
function StringListPanel({ title, list, esList, spanishEnabled, onSave, onSaveEs }) {
  const [raw, setRaw] = useState((list || []).join('\n'));
  const [rawEs, setRawEs] = useState((esList || []).join('\n'));
  const [showEs, setShowEs] = useState(false);

  const save = () => onSave(raw.split('\n').map((s) => s.trim()).filter(Boolean));
  const saveEs = () => onSaveEs(rawEs.split('\n').map((s) => s.trim()).filter(Boolean));

  return (
    <Panel title={title}>
      <textarea rows={6} value={raw} onChange={(e) => setRaw(e.target.value)} />
      <div className="row">
        <button className="btn-primary" onClick={save}>Save</button>
        {spanishEnabled && (
          <button className="btn-secondary" onClick={() => setShowEs((s) => !s)}>🌐 Español</button>
        )}
      </div>
      {showEs && (
        <div style={{ marginTop: 6, paddingLeft: 10, borderLeft: '2px solid #C9992E' }}>
          <p style={{ fontSize: '0.7rem', color: '#4A5A6B' }}>One line per rule, matching the English order above.</p>
          <textarea rows={6} value={rawEs} onChange={(e) => setRawEs(e.target.value)} />
          <button className="btn-secondary" onClick={saveEs}>Save Spanish Version</button>
        </div>
      )}
    </Panel>
  );
}

/* ---------- Special Collections ---------- */
function CollectionsPanel({ collections, onSave }) {
  const [name, setName] = useState('');
  const addItem = () => {
    if (!name.trim()) return;
    onSave([...collections, { id: `sc-${Date.now()}`, name: name.trim(), description: '' }]);
    setName('');
  };
  const remove = (id) => onSave(collections.filter((c) => c.id !== id));
  return (
    <Panel title="Special Collections">
      {collections.map((c) => (
        <div className="row" key={c.id} style={{ justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.85rem' }}>{c.name}</span>
          <button className="btn-secondary" style={{ padding: '2px 8px' }} onClick={() => remove(c.id)}>Remove</button>
        </div>
      ))}
      <input type="text" placeholder="New collection name" value={name} onChange={(e) => setName(e.target.value)} />
      <button className="btn-primary" onClick={addItem}>Add Collection</button>
    </Panel>
  );
}

/* ---------- Research / eResources links ---------- */
function LinksPanel({ title, links, onSave }) {
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const addItem = () => {
    if (!url.trim()) return;
    onSave([...links, { title: label.trim(), url: url.trim() }]);
    setLabel(''); setUrl('');
  };
  const remove = (idx) => onSave(links.filter((_, i) => i !== idx));
  return (
    <Panel title={title}>
      {links.map((l, i) => (
        <div className="row" key={i} style={{ justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.85rem' }}>{l.title || l.url}</span>
          <button className="btn-secondary" style={{ padding: '2px 8px' }} onClick={() => remove(i)}>Remove</button>
        </div>
      ))}
      <input type="text" placeholder="Link title" value={label} onChange={(e) => setLabel(e.target.value)} />
      <input type="text" placeholder="URL" value={url} onChange={(e) => setUrl(e.target.value)} />
      <button className="btn-primary" onClick={addItem}>Add Link</button>
    </Panel>
  );
}

/* ---------- Language settings ---------- */
function LanguageSettingsPanel({ bank, onSave }) {
  return (
    <Panel title="Multilingual / DLI Settings">
      <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.85rem' }}>
        <input
          type="checkbox"
          checked={!!bank.spanishEnabled}
          onChange={(e) => onSave({ ...bank, spanishEnabled: e.target.checked })}
        />
        Enable Spanish display toggle for students
      </label>
      <p style={{ fontSize: '0.75rem', color: '#4A5A6B', marginTop: 8 }}>
        When enabled, a language toggle appears in the header. Translations only
        show once you've saved them yourself in each content panel below — nothing
        publishes automatically.
      </p>
    </Panel>
  );
}

/* ---------- Announcements ---------- */
function AnnouncementsPanel({ bank, spanishEnabled, onSave }) {
  const [text, setText] = useState('');
  const addItem = () => {
    if (!text.trim()) return;
    const items = [...bank.items, {
      id: `ann-${Date.now()}`, text: text.trim(), active: true,
      schedule: null, es: { text: '', approved: false }
    }];
    onSave({ ...bank, items });
    setText('');
  };
  const toggleActive = (id) => {
    const items = bank.items.map((i) => i.id === id ? { ...i, active: !i.active } : i);
    onSave({ ...bank, items });
  };
  const remove = (id) => onSave({ ...bank, items: bank.items.filter((i) => i.id !== id) });

  return (
    <Panel title="Announcements">
      {bank.items.map((item) => (
        <div className="row" key={item.id} style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: '0.85rem' }}>
            <input type="checkbox" checked={item.active} onChange={() => toggleActive(item.id)} />
            {item.text}
          </label>
          <button className="btn-secondary" style={{ padding: '2px 8px' }} onClick={() => remove(item.id)}>Remove</button>
        </div>
      ))}
      <input type="text" placeholder="New announcement" value={text} onChange={(e) => setText(e.target.value)} />
      <button className="btn-primary" onClick={addItem}>Add Announcement</button>
      <p style={{ fontSize: '0.75rem', color: '#4A5A6B' }}>
        Checked = shows on the display now. Uncheck to retire it without deleting it.
      </p>
    </Panel>
  );
}

export default function AdminMode({ banks, updateBank, onExit }) {
  const [toast, fireToast] = useSaveToast();
  const spanishEnabled = !!banks.languageSettings?.spanishEnabled;

  const save = (bankName, value) => {
    updateBank(bankName, value);
    fireToast('Saved');
  };

  return (
    <div className="admin-shell">
      <div className="admin-topbar">
        <h1>Paisley IB Library — Admin Mode</h1>
        <button className="btn-secondary" onClick={onExit}>← Back to Display</button>
      </div>

      <div className="admin-grid">
        <SOIPanel bank={banks.statementsOfInquiry} spanishEnabled={spanishEnabled} onSave={(v) => save('statementsOfInquiry', v)} />

        <BankEditor
          title="Today's Inquiry Questions"
          bank={banks.inquiryQuestions}
          idPrefix="q"
          spanishEnabled={spanishEnabled}
          fields={[
            { key: 'factual', label: 'Factual', type: 'textarea' },
            { key: 'conceptual', label: 'Conceptual', type: 'textarea' },
            { key: 'debatable', label: 'Debatable', type: 'textarea' }
          ]}
          onSave={(v) => save('inquiryQuestions', v)}
        />

        <BankEditor
          title="ATL Skill Spotlight"
          bank={banks.atlSpotlights}
          idPrefix="atl"
          spanishEnabled={spanishEnabled}
          fields={[
            { key: 'category', label: 'Category', type: 'select', options: ['Research', 'Thinking', 'Communication', 'Self-Management', 'Social'] },
            { key: 'title', label: 'Subskill', type: 'text' },
            { key: 'text', label: 'Student-friendly explanation', type: 'textarea' }
          ]}
          onSave={(v) => save('atlSpotlights', v)}
        />

        <BankEditor
          title="Learner Profile Spotlight"
          bank={banks.learnerProfileSpotlights}
          idPrefix="lp"
          spanishEnabled={spanishEnabled}
          fields={[
            { key: 'attribute', label: 'Attribute', type: 'select', options: banks.learnerProfile },
            { key: 'text', label: 'Explanation', type: 'textarea' }
          ]}
          onSave={(v) => save('learnerProfileSpotlights', v)}
        />

        <BankEditor
          title="Today's Focus"
          bank={banks.todaysFocus}
          idPrefix="focus"
          spanishEnabled={spanishEnabled}
          fields={[
            { key: 'text', label: 'Focus prompt', type: 'text' },
            { key: 'subtext', label: 'Subtext (optional)', type: 'text' }
          ]}
          onSave={(v) => save('todaysFocus', v)}
        />

        <MediaPanel bank={banks.media} onSave={(v) => save('media', v)} />
        <VoicePanel bank={banks.voiceLevel} onSave={(v) => save('voiceLevel', v)} />
        <AnnouncementsPanel bank={banks.announcements} spanishEnabled={spanishEnabled} onSave={(v) => save('announcements', v)} />
        <LanguageSettingsPanel bank={banks.languageSettings} onSave={(v) => save('languageSettings', v)} />

        <CollectionsPanel collections={banks.specialCollections} onSave={(v) => save('specialCollections', v)} />
        <LinksPanel title="Research Help Links" links={banks.researchHelpLinks} onSave={(v) => save('researchHelpLinks', v)} />
        <LinksPanel title="eResources Links" links={banks.eResourcesLinks} onSave={(v) => save('eResourcesLinks', v)} />

        <StringListPanel
          title="General Library Rules" list={banks.rules.general} esList={banks.rules.es?.general}
          spanishEnabled={spanishEnabled}
          onSave={(v) => save('rules', { ...banks.rules, general: v })}
          onSaveEs={(v) => save('rules', { ...banks.rules, es: { ...banks.rules.es, general: v } })}
        />
        <StringListPanel
          title="Checkout & Borrowing Rules" list={banks.rules.checkout} esList={banks.rules.es?.checkout}
          spanishEnabled={spanishEnabled}
          onSave={(v) => save('rules', { ...banks.rules, checkout: v })}
          onSaveEs={(v) => save('rules', { ...banks.rules, es: { ...banks.rules.es, checkout: v } })}
        />
        <StringListPanel
          title="Yellow Tag / RYA Rules" list={banks.rules.yellowTag} esList={banks.rules.es?.yellowTag}
          spanishEnabled={spanishEnabled}
          onSave={(v) => save('rules', { ...banks.rules, yellowTag: v })}
          onSaveEs={(v) => save('rules', { ...banks.rules, es: { ...banks.rules.es, yellowTag: v } })}
        />
        <StringListPanel
          title="Media Office Notes" list={banks.rules.mediaOffice} esList={banks.rules.es?.mediaOffice}
          spanishEnabled={spanishEnabled}
          onSave={(v) => save('rules', { ...banks.rules, mediaOffice: v })}
          onSaveEs={(v) => save('rules', { ...banks.rules, es: { ...banks.rules.es, mediaOffice: v } })}
        />

        <StringListPanel
          title="The Garage Expectations" list={banks.spaces.garage} esList={banks.spaces.es?.garage}
          spanishEnabled={spanishEnabled}
          onSave={(v) => save('spaces', { ...banks.spaces, garage: v })}
          onSaveEs={(v) => save('spaces', { ...banks.spaces, es: { ...banks.spaces.es, garage: v } })}
        />
        <StringListPanel
          title="DOER Maker Space Expectations" list={banks.spaces.doerMaker} esList={banks.spaces.es?.doerMaker}
          spanishEnabled={spanishEnabled}
          onSave={(v) => save('spaces', { ...banks.spaces, doerMaker: v })}
          onSaveEs={(v) => save('spaces', { ...banks.spaces, es: { ...banks.spaces.es, doerMaker: v } })}
        />
        <StringListPanel
          title="Instructional Space Notes" list={banks.spaces.instructional} esList={banks.spaces.es?.instructional}
          spanishEnabled={spanishEnabled}
          onSave={(v) => save('spaces', { ...banks.spaces, instructional: v })}
          onSaveEs={(v) => save('spaces', { ...banks.spaces, es: { ...banks.spaces.es, instructional: v } })}
        />
        <StringListPanel
          title="Paisley Shelves Notes" list={banks.spaces.paisleyShelves} esList={banks.spaces.es?.paisleyShelves}
          spanishEnabled={spanishEnabled}
          onSave={(v) => save('spaces', { ...banks.spaces, paisleyShelves: v })}
          onSaveEs={(v) => save('spaces', { ...banks.spaces, es: { ...banks.spaces.es, paisleyShelves: v } })}
        />
        <StringListPanel
          title="Lowrance Shelves Notes" list={banks.spaces.lowranceShelves} esList={banks.spaces.es?.lowranceShelves}
          spanishEnabled={spanishEnabled}
          onSave={(v) => save('spaces', { ...banks.spaces, lowranceShelves: v })}
          onSaveEs={(v) => save('spaces', { ...banks.spaces, es: { ...banks.spaces.es, lowranceShelves: v } })}
        />
      </div>

      {toast && <div className="save-toast">{toast}</div>}
    </div>
  );
}
