import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen, Search, Lightbulb, MessageCircle, Target, ShieldCheck, Sprout, Clock, Volume2,
  Star, Brain, Shield, Globe2, Heart, Mountain, Scale, Cloud, ListChecks, Camera, Wrench,
  Users, Library, Link2, Globe, Maximize2, X, ChevronRight, Timer as TimerIcon, ExternalLink
} from 'lucide-react';
import { checkPin } from '../lib/blobsClient.js';
import { resolveActive, resolveActiveSOI, localize, isWithinSchedule, advanceToNext, advanceSOI } from '../lib/rotation.js';
import {
  RulesModal, SpaceModal, CollectionsModal, GenericInfoModal
} from './Overlays.jsx';

import iconInquirer from '../assets/attributes/inquirer.png';
import iconKnowledgeable from '../assets/attributes/knowledgeable.png';
import iconThinker from '../assets/attributes/thinker.png';
import iconCommunicator from '../assets/attributes/communicator.png';
import iconPrincipled from '../assets/attributes/principled.png';
import iconOpenMinded from '../assets/attributes/open-minded.png';
import iconCaring from '../assets/attributes/caring.png';
import iconRiskTaker from '../assets/attributes/risk-taker.png';
import iconBalanced from '../assets/attributes/balanced.png';
import iconReflective from '../assets/attributes/reflective.png';

import iconFactual from '../assets/icons/factual.png';
import iconConceptual from '../assets/icons/conceptual.png';
import iconDebatable from '../assets/icons/debatable.png';
import iconStatementLeaf from '../assets/icons/statement-leaf.png';
import iconAtlTarget from '../assets/icons/atl-target.png';
import iconAtlBook from '../assets/icons/atl-book.png';
import iconLearnerPerson from '../assets/icons/learner-person.png';
import iconFocusTarget from '../assets/icons/focus-target.png';
import iconFocusLeaf from '../assets/icons/focus-leaf.png';
import iconClock from '../assets/icons/clock.png';

import navRules from '../assets/nav/rules.png';
import navGarage from '../assets/nav/garage.png';
import navDoer from '../assets/nav/doer.png';
import navInstructional from '../assets/nav/instructional.png';
import navPaisleyShelves from '../assets/nav/paisley-shelves.png';
import navLowranceShelves from '../assets/nav/lowrance-shelves.png';
import navCollections from '../assets/nav/collections.png';

import mediaPlaceholder from '../assets/media/placeholder-books.png';
import mediaPlayButton from '../assets/media/play-button.png';

import headerWordmark from '../assets/header/wordmark.png';
import headerSublineEn from '../assets/header/subline-en.png';
import headerCenterSublineEn from '../assets/header/center-subline-en.png';
import headerGlobe from '../assets/header/globe.png';
import headerCuriosityBlock from '../assets/header/curiosity-block.png';
import headerDivider from '../assets/header/divider.png';
import headerScriptTagline from '../assets/header/script-tagline.png';

const ATL_COLORS = {
  Research: 'var(--green)',
  Thinking: 'var(--green)',
  Communication: 'var(--gold)',
  'Self-Management': '#3E7CB1',
  Social: '#B8860B'
};

const LP_ATTRIBUTE_ES = {
  Inquirer: 'Indagador', Knowledgeable: 'Informado', Thinker: 'Pensador',
  Communicator: 'Comunicador', Principled: 'Íntegro', 'Open-minded': 'De mente abierta',
  Caring: 'Solidario', 'Risk-taker': 'Audaz', Balanced: 'Equilibrado', Reflective: 'Reflexivo'
};

const LP_ICON_IMAGES = {
  Inquirer: iconInquirer, Knowledgeable: iconKnowledgeable, Thinker: iconThinker,
  Communicator: iconCommunicator, Principled: iconPrincipled, 'Open-minded': iconOpenMinded,
  Caring: iconCaring, 'Risk-taker': iconRiskTaker, Balanced: iconBalanced, Reflective: iconReflective
};

function Header({ language, onToggleLanguage, spanishEnabled }) {
  return (
    <header className="lib-header">
      <div className="brand">
        <div className="brand-mark"><Library size={20} strokeWidth={2.2} /></div>
        <div>
          <img className="wordmark-img" src={headerWordmark} alt="Paisley IB Library" />
          {language === 'es' ? (
            <div className="brand-subline">
              PERSONAS &middot; IDEAS &middot; INFORMACI&Oacute;N &middot; UN MA&Ntilde;ANA MEJOR
            </div>
          ) : (
            <img className="brand-subline-img" src={headerSublineEn} alt="People · Ideas · Information · A Brighter Tomorrow" />
          )}
        </div>
      </div>
      <div className="center-line">
        <div>
          {language === 'es'
            ? 'Indagar \u00b7 Leer \u00b7 Crear \u00b7 Conectar \u00b7 Marcar la Diferencia'
            : 'Inquire \u00b7 Read \u00b7 Create \u00b7 Connect \u00b7 Make a Difference'}
        </div>
        {language === 'es' ? (
          <div className="center-subline">
            UNA BIBLIOTECA COMPARTIDA &middot; UNA COMUNIDAD PR&Oacute;SPERA &middot; UN MUNDO M&Aacute;S INCLUSIVO
          </div>
        ) : (
          <img className="center-subline-img" src={headerCenterSublineEn} alt="A Shared Library · A Thriving Community · A More Inclusive World" />
        )}
      </div>
      <div className="side-note">
        <div className="side-note-top">
          <img className="header-globe-img" src={headerGlobe} alt="" />
          <img className="curiosity-block-img" src={headerCuriosityBlock} alt="Curiosity, Empathy, Knowledge, Action" />
        </div>
        <img className="header-divider-img" src={headerDivider} alt="" />
        <img className="header-script-img" src={headerScriptTagline} alt="Same Library. More Possibilities." />
        {spanishEnabled && (
          <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={onToggleLanguage}>
            {language === 'es' ? 'EN' : 'ES'}
          </button>
        )}
      </div>
    </header>
  );
}

function IconBadge({ icon: Icon, tone = 'navy', size = 16 }) {
  return (
    <span className={`title-badge tone-${tone}`}>
      <Icon size={size} strokeWidth={2.2} />
    </span>
  );
}

function ImgBadge({ src, tone = 'navy', alt = '' }) {
  return (
    <span className={`title-badge tone-${tone} title-badge-img`}>
      <img src={src} alt={alt} />
    </span>
  );
}

function BannerHeader({ icon: Icon, iconSrc, tone, children, onCycle, count }) {
  const clickable = onCycle && count > 1;
  return (
    <div className={`banner-header tone-bg-${tone}${clickable ? ' clickable' : ''}`} onClick={clickable ? onCycle : undefined}>
      {iconSrc ? <img className="banner-header-icon" src={iconSrc} alt="" /> : <Icon size={17} strokeWidth={2.2} />}
      <span>{children}</span>
      <CycleHint onCycle={onCycle} count={count} />
    </div>
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
    <div className="soi-bar" style={{ background: '#EAF3FB', borderColor: '#3E7CB1' }}>
      <span className="label" style={{ color: '#3E7CB1' }}>Announcement</span>
      <span>{active.map((a) => localize(a, 'text', language)).join('   \u2022   ')}</span>
    </div>
  );
}

function CycleHint({ onCycle, count }) {
  if (!onCycle || !count || count < 2) return null;
  return <ChevronRight size={16} className="cycle-hint" />;
}

function StatementOfInquiry({ soi, language, onCycle }) {
  const active = resolveActiveSOI(soi);
  const clickable = onCycle && (soi.items || []).filter(i => !i.archived).length > 1;
  return (
    <div className={`soi-bar${clickable ? ' clickable' : ''}`} onClick={clickable ? onCycle : undefined}>
      <ImgBadge src={iconStatementLeaf} tone="green" alt="" />
      <span className="label">Our Statement of Inquiry</span>
      <span>{localize(active, 'text', language)}</span>
      <CycleHint onCycle={onCycle} count={(soi.items || []).filter(i => !i.archived).length} />
    </div>
  );
}

function InquiryQuestions({ bank, language, onCycle }) {
  const q = resolveActive(bank);
  if (!q) return null;
  const clickable = onCycle && (bank.items || []).filter(i => !i.archived).length > 1;
  return (
    <div className="card">
      <p className={`card-title${clickable ? ' clickable' : ''}`} onClick={clickable ? onCycle : undefined}>
        <IconBadge icon={MessageCircle} tone="green" />Today's Inquiry Questions
        <CycleHint onCycle={onCycle} count={(bank.items || []).filter(i => !i.archived).length} />
      </p>
      <div className="iq-item factual">
        <span className="iq-type" style={{ color: 'var(--green)' }}><img className="iq-icon" src={iconFactual} alt="" /> Factual</span>
        {localize(q, 'factual', language)}
      </div>
      <div className="iq-item conceptual">
        <span className="iq-type" style={{ color: 'var(--gold)' }}><img className="iq-icon" src={iconConceptual} alt="" /> Conceptual</span>
        {localize(q, 'conceptual', language)}
      </div>
      <div className="iq-item debatable">
        <span className="iq-type" style={{ color: 'var(--green)' }}><img className="iq-icon" src={iconDebatable} alt="" /> Debatable</span>
        {localize(q, 'debatable', language)}
      </div>
    </div>
  );
}

function LibraryLearningSpace({ media, onExpand, onCycle }) {
  const current = resolveActive(media);
  const clickable = onCycle && (media.items || []).filter(i => !i.archived).length > 1;
  return (
    <div className="card">
      <p className={`card-title${clickable ? ' clickable' : ''}`} onClick={clickable ? onCycle : undefined}>
        <IconBadge icon={BookOpen} tone="navy" />Library Learning Space
        <CycleHint onCycle={onCycle} count={(media.items || []).filter(i => !i.archived).length} />
      </p>
      <div className="learning-space" onClick={onExpand}>
        {!current && (
          <>
            <img className="placeholder-bg" src={mediaPlaceholder} alt="" />
            <div className="placeholder-scrim" />
            <div className="placeholder-content">
              <img className="placeholder-play" src={mediaPlayButton} alt="" />
              <div style={{ fontSize: '1.4rem', marginTop: 12, marginBottom: 8 }} className="accent-script">
                Ideas &middot; People &middot; Perspectives &middot; Change
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>
                Add a link in Admin Mode, then tap the title above to select it.
              </div>
            </div>
          </>
        )}
        {current?.type === 'image' && <img src={current.url} alt={current.title || 'Library media'} />}
        {current && current.type !== 'image' && (
          <iframe src={current.url} title={current.title || 'Library media'} allow="autoplay; fullscreen" />
        )}
        {current && <div className="caption">{current.title || 'Tap to open full screen'}</div>}
        {current && current.type !== 'image' && (
          <a
            className="open-new-tab-link"
            href={current.url}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={12} /> Open in new tab
          </a>
        )}
        <button className="expand-btn" onClick={(e) => { e.stopPropagation(); onExpand(); }}><Maximize2 size={13} /> Expand</button>
      </div>
    </div>
  );
}

function FullscreenClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const dateStr = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  return (
    <div className="fs-clock">
      <div className="fs-clock-time">{timeStr}</div>
      <div className="fs-clock-date">{dateStr}</div>
    </div>
  );
}

function useTimerCountdown(timer) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!timer?.endsAt) return undefined;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [timer?.endsAt]);

  const remaining = timer?.endsAt
    ? Math.max(0, Math.round((timer.endsAt - now) / 1000))
    : (timer?.remainingSeconds ?? 0);
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  const isRunning = !!timer?.endsAt;
  const isDone = isRunning && remaining <= 0;
  return { display: `${mm}:${ss}`, isRunning, isDone, remaining };
}

function FullscreenTimer({ timer }) {
  const { display, isRunning, isDone } = useTimerCountdown(timer);
  if (!timer || !timer.enabled) return null;
  return (
    <div className={`fs-timer${isDone ? ' fs-timer-done' : ''}`}>
      <div className="fs-timer-label">{timer.label || 'Timer'}</div>
      <div className="fs-timer-time">{display}</div>
      {!isRunning && <div className="fs-timer-status">Paused</div>}
    </div>
  );
}

function MediaFullscreen({ media, timer, onClose }) {
  const current = resolveActive(media);
  return (
    <div className="media-fullscreen-overlay">
      <div className="fs-side-panel">
        <FullscreenClock />
        <FullscreenTimer timer={timer} />
      </div>
      <div className="fs-bar">
        {current && current.type !== 'image' && (
          <a className="btn-secondary open-new-tab-link-fs" href={current.url} target="_blank" rel="noreferrer"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.4)' }}>
            <ExternalLink size={14} /> Open in New Tab
          </a>
        )}
        <button className="btn-secondary" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.4)' }} onClick={onClose}>
          <X size={15} /> Exit Full Screen
        </button>
      </div>
      <div className="fs-content">
        {current?.type === 'image' && <img src={current.url} alt={current.title || 'Library media'} />}
        {current && current.type !== 'image' && (
          <iframe src={current.url} title={current.title || 'Library media'} allow="autoplay; fullscreen" />
        )}
        {!current && (
          <div style={{ color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            No media selected yet.
          </div>
        )}
      </div>
    </div>
  );
}

function ATLSpotlight({ bank, language, onCycle }) {
  const item = resolveActive(bank);
  if (!item) return null;
  return (
    <div className="card banner-card">
      <BannerHeader iconSrc={iconAtlTarget} tone="green" onCycle={onCycle} count={(bank.items || []).filter(i => !i.archived).length}>ATL Skill Spotlight</BannerHeader>
      <div className="banner-body">
        <div className="spotlight-row">
          <div className="spotlight-badge spotlight-badge-img">
            <img src={iconAtlBook} alt="" />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{item.category}</div>
            <div style={{ fontWeight: 700, color: 'var(--navy)', marginTop: 2 }}>{localize(item, 'title', language)}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', marginTop: 4 }}>{localize(item, 'text', language)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LearnerProfileSpotlight({ bank, language, onCycle }) {
  const item = resolveActive(bank);
  if (!item) return null;
  const attrLabel = language === 'es' && LP_ATTRIBUTE_ES[item.attribute] ? LP_ATTRIBUTE_ES[item.attribute] : item.attribute;
  const iconSrc = LP_ICON_IMAGES[item.attribute];
  return (
    <div className="card banner-card">
      <BannerHeader iconSrc={iconLearnerPerson} tone="navy" onCycle={onCycle} count={(bank.items || []).filter(i => !i.archived).length}>Learner Profile Spotlight</BannerHeader>
      <div className="banner-body">
        <div className="spotlight-row">
          <div className="spotlight-badge spotlight-badge-img">
            {iconSrc ? <img src={iconSrc} alt="" /> : <Shield size={16} color="var(--navy)" />}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{attrLabel}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', marginTop: 4 }}>{localize(item, 'text', language)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LearnerProfileStrip({ attributes, language }) {
  return (
    <div className="card lp-strip">
      <p className="card-title full-width"><IconBadge icon={Star} tone="gold" />All Learner Profile Attributes</p>
      <div className="lp-row">
        {attributes.map((name) => {
          const iconSrc = LP_ICON_IMAGES[name];
          return (
            <div className="lp-attr" key={name}>
              <div className="dot dot-img">
                {iconSrc ? <img src={iconSrc} alt="" /> : <Shield size={16} color="var(--navy)" />}
              </div>
              <span className="name">{language === 'es' && LP_ATTRIBUTE_ES[name] ? LP_ATTRIBUTE_ES[name] : name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TodaysFocus({ bank, language, onCycle }) {
  const item = resolveActive(bank);
  if (!item) return null;
  const subtext = localize(item, 'subtext', language);
  return (
    <div className="card banner-card">
      <BannerHeader iconSrc={iconFocusTarget} tone="green" onCycle={onCycle} count={(bank.items || []).filter(i => !i.archived).length}>Today's Focus</BannerHeader>
      <div className="banner-body">
        <div className="focus-text">{localize(item, 'text', language)}</div>
        {subtext && <div className="focus-subtext"><img className="focus-leaf-icon" src={iconFocusLeaf} alt="" /> {subtext}</div>}
      </div>
    </div>
  );
}

function TimerCard({ timer }) {
  const { display, isRunning, isDone } = useTimerCountdown(timer);
  if (!timer || !timer.enabled) return null;
  return (
    <div className="card">
      <p className="card-title"><IconBadge icon={TimerIcon} tone="gold" />{timer?.label || 'Timer'}</p>
      <div className={`timer-display${isDone ? ' timer-done' : ''}`}>{display}</div>
      <div className="timer-status">{isRunning ? 'Running' : isDone ? "Time's up" : 'Paused — set in Admin Mode'}</div>
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
      <p className="card-title"><ImgBadge src={iconClock} tone="navy" /> Current Time</p>
      <div className="clock-time">{timeStr}</div>
      <div className="clock-date">{dateStr}</div>
      <div className="clock-tagline">BE CURIOUS. BE KIND. BELONG HERE.</div>
    </div>
  );
}

function VoiceLevelCard({ voiceLevel }) {
  const level = voiceLevel.levels.find((l) => l.level === voiceLevel.current) || voiceLevel.levels[0];
  return (
    <div className="card">
      <p className="card-title"><IconBadge icon={Volume2} tone="green" />Voice Level</p>
      <div className="voice-level-badge">
        <span className="num">{level.level}</span>
        <div>
          <div style={{ fontWeight: 700 }}>{level.label}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>{level.description}</div>
        </div>
      </div>
    </div>
  );
}

function BottomNav({ onOpen, footerHint, onFooterClick }) {
  const buttons = [
    { key: 'rules', label: 'Library Rules', sub: '', icon: ListChecks, img: navRules },
    { key: 'garage', label: 'The Garage', sub: 'Green Screen Room', icon: Camera, img: navGarage },
    { key: 'doer', label: 'DOER Maker Space', sub: 'Create · Collaborate', icon: Wrench, img: navDoer },
    { key: 'instructional', label: 'Instructional Space', sub: '', icon: Users, img: navInstructional },
    { key: 'paisleyShelves', label: 'Paisley Shelves', sub: '', icon: BookOpen, img: navPaisleyShelves },
    { key: 'lowranceShelves', label: 'Lowrance Shelves', sub: '', icon: BookOpen, img: navLowranceShelves },
    { key: 'collections', label: 'Special Collections', sub: '', icon: Star, img: navCollections },
    { key: 'research', label: 'Links', sub: '', icon: Link2, img: null }
  ];
  return (
    <nav className="bottom-nav">
      <div className="nav-buttons">
        {buttons.map((b) => (
          b.img ? (
            <button key={b.key} className="nav-btn nav-btn-img" onClick={() => onOpen(b.key)}>
              <img src={b.img} alt={b.label} />
            </button>
          ) : (
            <button key={b.key} className="nav-btn" onClick={() => onOpen(b.key)}>
              <b.icon size={16} className="nav-icon" />
              <span className="nav-btn-text">
                <span>{b.label}</span>
                {b.sub && <span className="sub">{b.sub}</span>}
              </span>
            </button>
          )
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
        <h2 style={{ color: 'var(--navy)', marginTop: 0 }}>Admin Mode</h2>
        <p style={{ color: 'var(--ink-soft)', fontSize: '0.85rem' }}>Enter the library PIN to continue.</p>
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
  // Ephemeral, local-only "tap to cycle" state. Deliberately NOT persisted
  // to Netlify Blobs and NOT gated behind Admin login: it only ever picks
  // among items Grace already approved in Admin Mode, and it resets on
  // reload, so it can't be used to add/edit/remove content — just to
  // browse the already-approved set live while presenting.
  const [overrides, setOverrides] = useState({});

  const spanishEnabled = !!banks.languageSettings?.spanishEnabled;

  const withHeld = (key, bank) => (key in overrides ? { ...bank, mode: 'hold', heldId: overrides[key] } : bank);
  const cycle = (key, bank) => {
    const next = advanceToNext(withHeld(key, bank));
    setOverrides((o) => ({ ...o, [key]: next.heldId }));
  };

  const soiWithOverride = 'soi' in overrides ? { ...banks.statementsOfInquiry, activeId: overrides.soi } : banks.statementsOfInquiry;
  const cycleSOI = () => {
    const next = advanceSOI(soiWithOverride);
    setOverrides((o) => ({ ...o, soi: next.activeId }));
  };

  const iqBank = withHeld('inquiryQuestions', banks.inquiryQuestions);
  const atlBank = withHeld('atlSpotlights', banks.atlSpotlights);
  const lpBank = withHeld('learnerProfileSpotlights', banks.learnerProfileSpotlights);
  const focusBank = withHeld('todaysFocus', banks.todaysFocus);
  const mediaBank = withHeld('media', banks.media);

  return (
    <div className={`app-shell${isFullscreen ? ' fullscreen-active' : ''}`}>
      <Header
        language={language}
        spanishEnabled={spanishEnabled}
        onToggleLanguage={() => setLanguage((l) => (l === 'es' ? 'en' : 'es'))}
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '4px 24px 0' }}>
        <button className="btn-secondary" onClick={onToggleFullscreen}>
          <Maximize2 size={14} /> {isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
        </button>
      </div>

      <div className="dashboard-stack">
        <AnnouncementsBanner bank={banks.announcements} language={language} />

        <StatementOfInquiry soi={soiWithOverride} language={language} onCycle={cycleSOI} />

        <div className="main-row">
          <div className="col-iq">
            <InquiryQuestions bank={iqBank} language={language} onCycle={() => cycle('inquiryQuestions', banks.inquiryQuestions)} />
            <VoiceLevelCard voiceLevel={banks.voiceLevel} />
          </div>
          <div className="col-media">
            <LibraryLearningSpace media={mediaBank} onExpand={() => setMediaExpanded(true)} onCycle={() => cycle('media', banks.media)} />
            <ClockCard />
            <TimerCard timer={banks.timer} />
          </div>
          <div className="sidebar-stack">
            <ATLSpotlight bank={atlBank} language={language} onCycle={() => cycle('atlSpotlights', banks.atlSpotlights)} />
            <LearnerProfileSpotlight bank={lpBank} language={language} onCycle={() => cycle('learnerProfileSpotlights', banks.learnerProfileSpotlights)} />
            <TodaysFocus bank={focusBank} language={language} onCycle={() => cycle('todaysFocus', banks.todaysFocus)} />
          </div>
        </div>

        <LearnerProfileStrip attributes={banks.learnerProfile} language={language} />
      </div>

      <BottomNav
        onOpen={setOpenOverlay}
        onFooterClick={() => setShowPinModal(true)}
      />

      {mediaExpanded && (
        <MediaFullscreen media={mediaBank} timer={banks.timer} onClose={() => setMediaExpanded(false)} />
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
