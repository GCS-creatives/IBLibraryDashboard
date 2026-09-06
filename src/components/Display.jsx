import React, { useState, useEffect, useMemo } from 'react';
import { checkPin } from '../lib/blobsClient.js';
import { resolveActive, resolveActiveSOI, localize, isWithinSchedule } from '../lib/rotation.js';
import {
  RulesModal, SpaceModal, CollectionsModal, GenericInfoModal
} from './Overlays.jsx';

const ATL_COLORS = {
  Research: '#7B4EA8',
  Thinking: '#2E6E4E',
  Communication: '#C9992E',
  'Self-Management': '#3E7CB1',
  Social: '#B8860B'
};

const LP_ATTRIBUTE_ES = {
  Inquirer: 'Indagador', Knowledgeable: 'Informado', Thinker: 'Pensador',
  Communicator: 'Comunicador', Principled: 'Íntegro', 'Open-minded': 'De mente abierta',
  Caring: 'Solidario', 'Risk-taker': 'Audaz', Balanced: 'Equilibrado', Reflective: 'Reflexivo'
};

function Header({ language, onToggleLanguage, spanishEnabled }) {
  return (
    <header className="lib-header">
      <div className="brand">
        <h1>PAISLEY <span className="accent">IB</span> LIBRARY</h1>
      </div>
      <div className="center-line">
        {language === 'es'
          ? 'Indagar \u00b7 Leer \u00b7 Crear \u00b7 Conectar \u00b7 Marcar la Diferencia'
          : 'Inquire \u00b7 Read \u00b7 Create \u00b7 Connect \u00b7 Make a Difference'}
      </div>
      <div className="side-note" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span>People &middot; Ideas &middot; Information<br />A Shared Library</span>
        {spanishEnabled && (
          <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={onToggleLanguage}>
            {language === 'es' ? 'EN' : 'ES'}
          </button>
        )}
      </div>
    </header>
  );
}

function AnnouncementsBanner({ bank, language }) {
  const today = new Date();
  const active = (bank?.items || []).filter((a) => {
    if (a.schedule) return isWithinSchedule(a.schedule, today);
    return a.active;
  });
  if (active.length === 0) return null;
  return (
    <div className="soi-bar area-ann" style={{ background: '#EAF3FB', borderColor: '#3E7CB1' }}>
      <span className="label" style={{ color: '#3E7CB1' }}>Announcement</span>
      <span>{active.map((a) => localize(a, 'text', language)).join('   \u2022   ')}</span>
    </div>
  );
}

function StatementOfInquiry({ soi, language }) {
  const active = resolveActiveSOI(soi);
  return (
    <div className="soi-bar area-soi">
      <span className="label">Our Statement of Inquiry</span>
      <span>{localize(active, 'text', language)}</span>
    </div>
  );
}

function InquiryQuestions({ bank, language }) {
  const q = resolveActive(bank);
  if (!q) return null;
  return (
    <div className="card area-iq">
      <p className="card-title">🔎 Today's Inquiry Questions</p>
      <div className="iq-item factual">
        <span className="iq-type" style={{ color: '#2E6E4E' }}>Factual</span>
        {localize(q, 'factual', language)}
      </div>
      <div className="iq-item conceptual">
        <span className="iq-type" style={{ color: '#C9992E' }}>Conceptual</span>
        {localize(q, 'conceptual', language)}
      </div>
      <div className="iq-item debatable">
        <span className="iq-type" style={{ color: '#2E6E4E' }}>Debatable</span>
        {localize(q, 'debatable', language)}
      </div>
    </div>
  );
}

function LibraryLearningSpace({ media, onExpand }) {
  const current = media?.current;
  return (
    <div className="card area-media">
      <p className="card-title">📖 Library Learning Space</p>
      <div className="learning-space" onClick={onExpand}>
        {!current && (
          <div style={{ color: 'white', textAlign: 'center', padding: 20 }}>
            <div style={{ fontSize: '1.4rem', marginBottom: 8 }} className="accent-script">
              Ideas &middot; People &middot; Perspectives &middot; Change
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.75 }}>
              Add a video, slideshow, website, or resource in Admin Mode.
            </div>
          </div>
        )}
        {current?.type === 'image' && <img src={current.url} alt={current.title || 'Library media'} />}
        {current && current.type !== 'image' && (
          <iframe src={current.url} title={current.title || 'Library media'} allow="autoplay; fullscreen" />
        )}
        {current && <div className="caption">{current.title || 'Tap to open full screen'}</div>}
        <button className="expand-btn" onClick={(e) => { e.stopPropagation(); onExpand(); }}>⤢ Expand</button>
      </div>
    </div>
  );
}

function MediaFullscreen({ media, onClose }) {
  const current = media?.current;
  return (
    <div className="media-fullscreen-overlay">
      <div className="fs-bar">
        <button className="btn-secondary" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.4)' }} onClick={onClose}>
          ✕ Exit Full Screen
        </button>
      </div>
      <div className="fs-content">
        {current?.type === 'image' && <img src={current.url} alt={current.title || 'Library media'} />}
        {current && current.type !== 'image' && (
          <iframe src={current.url} title={current.title || 'Library media'} allow="autoplay; fullscreen" />
        )}
        {!current && (
          <div style={{ color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            No media loaded yet.
          </div>
        )}
      </div>
    </div>
  );
}

function ATLSpotlight({ bank, language }) {
  const item = resolveActive(bank);
  if (!item) return null;
  return (
    <div className="card">
      <p className="card-title">🎯 ATL Skill Spotlight</p>
      <div className="spotlight-row">
        <div className="spotlight-badge" style={{ background: ATL_COLORS[item.category] || '#2E6E4E' }}>★</div>
        <div>
          <div style={{ fontWeight: 700, color: '#10294A' }}>{item.category} — {localize(item, 'title', language)}</div>
          <div style={{ fontSize: '0.85rem', color: '#4A5A6B' }}>{localize(item, 'text', language)}</div>
        </div>
      </div>
    </div>
  );
}

function LearnerProfileSpotlight({ bank, language }) {
  const item = resolveActive(bank);
  if (!item) return null;
  const attrLabel = language === 'es' && LP_ATTRIBUTE_ES[item.attribute] ? LP_ATTRIBUTE_ES[item.attribute] : item.attribute;
  return (
    <div className="card">
      <p className="card-title">⭐ Learner Profile Spotlight</p>
      <div style={{ fontWeight: 700, color: '#10294A' }}>{attrLabel}</div>
      <div style={{ fontSize: '0.85rem', color: '#4A5A6B' }}>{localize(item, 'text', language)}</div>
    </div>
  );
}

function LearnerProfileStrip({ attributes, language }) {
  return (
    <div className="card lp-strip area-lp">
      {attributes.map((name) => (
        <div className="lp-attr" key={name}>
          <div className="dot">{name[0]}</div>
          <span className="name">{language === 'es' && LP_ATTRIBUTE_ES[name] ? LP_ATTRIBUTE_ES[name] : name}</span>
        </div>
      ))}
    </div>
  );
}

function TodaysFocus({ bank, language }) {
  const item = resolveActive(bank);
  if (!item) return null;
  const subtext = localize(item, 'subtext', language);
  return (
    <div className="card area-focus">
      <p className="card-title">🌱 Today's Focus</p>
      <div className="focus-text">{localize(item, 'text', language)}</div>
      {subtext && <div className="focus-subtext">{subtext}</div>}
    </div>
  );
}

function ClockCard({}) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000 * 15);
    return () => clearInterval(t);
  }, []);
  const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const dateStr = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="card">
      <p className="card-title">🕐 Current Time</p>
      <div className="clock-time">{timeStr}</div>
      <div className="clock-date">{dateStr}</div>
    </div>
  );
}

function VoiceLevelCard({ voiceLevel }) {
  const level = voiceLevel.levels.find((l) => l.level === voiceLevel.current) || voiceLevel.levels[0];
  return (
    <div className="card">
      <p className="card-title">🔊 Voice Level</p>
      <div className="voice-level-badge">
        <span className="num">{level.level}</span>
        <div>
          <div style={{ fontWeight: 700 }}>{level.label}</div>
          <div style={{ fontSize: '0.75rem', color: '#4A5A6B' }}>{level.description}</div>
        </div>
      </div>
    </div>
  );
}

function BottomNav({ onOpen, footerHint, onFooterClick }) {
  const buttons = [
    { key: 'rules', label: 'Library Rules', sub: '' },
    { key: 'garage', label: 'The Garage', sub: 'Green Screen Room' },
    { key: 'doer', label: 'DOER Maker Space', sub: 'Create · Collaborate' },
    { key: 'instructional', label: 'Instructional Space', sub: '' },
    { key: 'paisleyShelves', label: 'Paisley Shelves', sub: '' },
    { key: 'lowranceShelves', label: 'Lowrance Shelves', sub: '' },
    { key: 'collections', label: 'Special Collections', sub: '' },
    { key: 'research', label: 'Links', sub: '' }
  ];
  return (
    <nav className="bottom-nav">
      <div className="nav-buttons">
        {buttons.map((b) => (
          <button key={b.key} className="nav-btn" onClick={() => onOpen(b.key)}>
            <span>{b.label}</span>
            {b.sub && <span className="sub">{b.sub}</span>}
          </button>
        ))}
      </div>
      <div className="footer-line" onClick={onFooterClick} title="">
        GCS Creative Project by Grace Campbell-Sheran &copy; {new Date().getFullYear()}. All rights reserved.
      </div>
    </nav>
  );
}

function AdminPinModal({ onClose, onSuccess }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  const submit = async () => {
    setChecking(true);
    setError('');
    const result = await checkPin(pin);
    setChecking(false);
    if (result.ok) {
      onSuccess(result.token);
    } else {
      setError('Incorrect PIN.');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="admin-login-box" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ color: '#10294A', marginTop: 0 }}>Admin Mode</h2>
        <p style={{ color: '#4A5A6B', fontSize: '0.85rem' }}>Enter the library PIN to continue.</p>
        <input
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          autoFocus
        />
        {error && <div className="error-text">{error}</div>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 10 }}>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={submit} disabled={checking}>
            {checking ? 'Checking…' : 'Enter'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DisplayMode({ banks, isFullscreen, onToggleFullscreen, onRequestAdmin }) {
  const [openOverlay, setOpenOverlay] = useState(null);
  const [mediaExpanded, setMediaExpanded] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [language, setLanguage] = useState(banks.languageSettings?.defaultLanguage || 'en');

  const spanishEnabled = !!banks.languageSettings?.spanishEnabled;

  return (
    <div className={`app-shell${isFullscreen ? ' fullscreen-active' : ''}`}>
      <Header
        language={language}
        spanishEnabled={spanishEnabled}
        onToggleLanguage={() => setLanguage((l) => (l === 'es' ? 'en' : 'es'))}
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 24px 0' }}>
        <button className="btn-secondary" onClick={onToggleFullscreen}>
          {isFullscreen ? '⤢ Exit Full Screen' : '⤢ Full Screen'}
        </button>
      </div>

      <div className="dashboard-grid">
        <AnnouncementsBanner bank={banks.announcements} language={language} />

        <StatementOfInquiry soi={banks.statementsOfInquiry} language={language} />

        <InquiryQuestions bank={banks.inquiryQuestions} language={language} />
        <LibraryLearningSpace media={banks.media} onExpand={() => setMediaExpanded(true)} />
        <div className="sidebar-stack area-side">
          <ATLSpotlight bank={banks.atlSpotlights} language={language} />
          <LearnerProfileSpotlight bank={banks.learnerProfileSpotlights} language={language} />
          <ClockCard />
          <VoiceLevelCard voiceLevel={banks.voiceLevel} />
        </div>

        <LearnerProfileStrip attributes={banks.learnerProfile} language={language} />
        <TodaysFocus bank={banks.todaysFocus} language={language} />
      </div>

      <BottomNav
        onOpen={setOpenOverlay}
        onFooterClick={() => setShowPinModal(true)}
      />

      {mediaExpanded && (
        <MediaFullscreen media={banks.media} onClose={() => setMediaExpanded(false)} />
      )}

      {openOverlay === 'rules' && <RulesModal rules={banks.rules} language={language} onClose={() => setOpenOverlay(null)} />}
      {openOverlay === 'garage' && (
        <SpaceModal title="The Garage" subtitle="Green Screen / Media Creation Room" items={banks.spaces.garage} esItems={banks.spaces.es?.garage} language={language} onClose={() => setOpenOverlay(null)} />
      )}
      {openOverlay === 'doer' && (
        <SpaceModal title="DOER Maker / Collaboration Space" subtitle="Do · Organize · Explore · Reflect" items={banks.spaces.doerMaker} esItems={banks.spaces.es?.doerMaker} language={language} onClose={() => setOpenOverlay(null)} />
      )}
      {openOverlay === 'instructional' && (
        <SpaceModal title="Instructional Space" items={banks.spaces.instructional} esItems={banks.spaces.es?.instructional} language={language} onClose={() => setOpenOverlay(null)} />
      )}
      {openOverlay === 'paisleyShelves' && (
        <SpaceModal title="Paisley Shelves" items={banks.spaces.paisleyShelves} esItems={banks.spaces.es?.paisleyShelves} language={language} onClose={() => setOpenOverlay(null)} />
      )}
      {openOverlay === 'lowranceShelves' && (
        <SpaceModal title="Lowrance Shelves" items={banks.spaces.lowranceShelves} esItems={banks.spaces.es?.lowranceShelves} language={language} onClose={() => setOpenOverlay(null)} />
      )}
      {openOverlay === 'collections' && (
        <CollectionsModal collections={banks.specialCollections} onClose={() => setOpenOverlay(null)} />
      )}
      {openOverlay === 'research' && (
        <GenericInfoModal
          title="Links"
          links={[...(banks.eResourcesLinks || []), ...(banks.researchHelpLinks || [])]}
          onClose={() => setOpenOverlay(null)}
        />
      )}

      {showPinModal && (
        <AdminPinModal
          onClose={() => setShowPinModal(false)}
          onSuccess={(token) => {
            setShowPinModal(false);
            onRequestAdmin(token);
          }}
        />
      )}
    </div>
  );
}
