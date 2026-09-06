import React from 'react';

function ModalShell({ children, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        {children}
      </div>
    </div>
  );
}

// Pairs an English array with an optional same-length (or shorter) Spanish
// array. Falls back to English line-by-line if a Spanish line is missing.
function localizeList(enList, esList, language) {
  if (language !== 'es' || !esList || esList.length === 0) return enList;
  return enList.map((line, i) => esList[i] || line);
}

export function RulesModal({ rules, language, onClose }) {
  const es = rules.es || {};
  return (
    <ModalShell onClose={onClose}>
      <h2>{language === 'es' ? 'Reglas de la Biblioteca' : 'Library Rules'}</h2>

      <h3>{language === 'es' ? 'Expectativas Generales' : 'General Library Expectations'}</h3>
      <ul>{localizeList(rules.general, es.general, language).map((r, i) => <li key={i}>{r}</li>)}</ul>

      <h3>{language === 'es' ? 'Préstamo de Materiales' : 'Checkout & Borrowing'}</h3>
      <ul>{localizeList(rules.checkout, es.checkout, language).map((r, i) => <li key={i}>{r}</li>)}</ul>

      <h3>{language === 'es' ? 'Materiales Etiqueta Amarilla / RYA' : 'Yellow Tag / RYA Materials'}</h3>
      <ul>{localizeList(rules.yellowTag, es.yellowTag, language).map((r, i) => <li key={i}>{r}</li>)}</ul>

      <h3>{language === 'es' ? 'Oficina de Medios' : 'Media Office'}</h3>
      <ul>{localizeList(rules.mediaOffice, es.mediaOffice, language).map((r, i) => <li key={i}>{r}</li>)}</ul>
    </ModalShell>
  );
}

export function SpaceModal({ title, subtitle, items, esItems, language, onClose }) {
  const lines = localizeList(items || [], esItems, language);
  return (
    <ModalShell onClose={onClose}>
      <h2>{title}</h2>
      {subtitle && <p style={{ color: 'var(--ink-soft)', marginTop: -8 }}>{subtitle}</p>}
      <ul>{lines.map((r, i) => <li key={i}>{r}</li>)}</ul>
    </ModalShell>
  );
}

export function CollectionsModal({ collections, onClose }) {
  return (
    <ModalShell onClose={onClose}>
      <h2>Special Collections</h2>
      <ul>
        {(collections || []).map((c) => (
          <li key={c.id}>
            <strong>{c.name}</strong>{c.description ? ` — ${c.description}` : ''}
          </li>
        ))}
      </ul>
    </ModalShell>
  );
}

export function GenericInfoModal({ title, links, onClose }) {
  return (
    <ModalShell onClose={onClose}>
      <h2>{title}</h2>
      {(!links || links.length === 0) && (
        <p style={{ color: 'var(--ink-soft)' }}>No links added yet. Grace can add these in Admin Mode.</p>
      )}
      <ul>
        {(links || []).map((l, i) => (
          <li key={i}><a href={l.url} target="_blank" rel="noreferrer">{l.title || l.url}</a></li>
        ))}
      </ul>
    </ModalShell>
  );
}
