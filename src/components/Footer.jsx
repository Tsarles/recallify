import { useEffect, useState } from 'react';

const PANELS = {
  about: { icon: 'bx-info-circle', eyebrow: 'The short version', title: 'Built to turn notes into practice' },
  terms: { icon: 'bx-file', eyebrow: 'Plain-language policy', title: 'Terms & privacy notes' },
};

function InfoModal({ initialPanel, onClose }) {
  const [panel, setPanel] = useState(initialPanel);
  const meta = PANELS[panel];
  useEffect(() => {
    const onKeyDown = (event) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return <div className="modal-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="info-book sketch-card" role="dialog" aria-modal="true" aria-labelledby="info-title">
      <aside className="info-book-tabs" aria-label="Information pages">
        <button className={panel === 'about' ? 'active' : ''} onClick={() => setPanel('about')}><i className="bx bx-info-circle" /><span>About</span></button>
        <button className={panel === 'terms' ? 'active' : ''} onClick={() => setPanel('terms')}><i className="bx bx-file" /><span>Terms</span></button>
      </aside>
      <div className="info-book-page">
        <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close information"><i className="bx bx-x" /></button>
        <header><span className="info-icon"><i className={`bx ${meta.icon}`} /></span><div><p>{meta.eyebrow}</p><h2 id="info-title">{meta.title}</h2></div></header>
        <div className="info-book-scroll">{panel === 'about' ? <AboutContent /> : <TermsContent />}</div>
      </div>
      <style>{`
        .info-book { width:min(760px,96vw); height:min(680px,88svh); display:grid; grid-template-columns:112px 1fr; overflow:hidden; background:#fff; }
        .info-book-tabs { display:flex; flex-direction:column; gap:8px; padding:24px 10px; background:#173f35; }
        .info-book-tabs button { display:grid; justify-items:center; gap:5px; padding:12px 5px; border:1px solid rgba(255,255,255,.28); border-radius:9px; background:transparent; color:#fff; cursor:pointer; font:600 .78rem var(--font-body); }
        .info-book-tabs button i { font-size:1.3rem; }.info-book-tabs button.active { background:var(--yellow); color:var(--ink); border-color:var(--ink); box-shadow:2px 2px 0 var(--ink); }
        .info-book-page { min-width:0; display:flex; flex-direction:column; position:relative; background-image:linear-gradient(var(--paper-dark) 1px,transparent 1px); background-size:100% 30px; }
        .info-book-page > header { display:flex; align-items:center; gap:14px; padding:25px 58px 20px 26px; border-bottom:2px solid var(--ink); background:#fff; }
        .info-book-page > header p { color:#246b5a; font:700 .76rem var(--font-display); text-transform:uppercase; letter-spacing:.07em; }.info-book-page > header h2 { font-size:clamp(1.35rem,4vw,1.9rem); }
        .info-icon { width:46px; height:46px; display:grid; place-items:center; flex:0 0 auto; border:2px solid var(--ink); border-radius:12px; background:var(--yellow-bg); box-shadow:3px 3px 0 var(--ink); font-size:1.4rem; }
        .info-book-scroll { overflow-y:auto; padding:24px 28px 30px; }.info-lead { color:var(--ink-light); font-size:1rem; line-height:1.7; margin-bottom:20px; }
        .info-version { display:inline-flex; align-items:center; gap:6px; margin-bottom:13px; padding:4px 9px; border:1.5px solid #173f35; border-radius:99px; color:#173f35; font:700 .75rem var(--font-display); background:var(--green-bg); }
        .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }.info-section { padding:15px; border:1.5px solid var(--border); border-radius:11px; background:rgba(255,255,255,.92); }
        .info-section h3 { display:flex; align-items:center; gap:7px; margin-bottom:7px; font-size:1rem; }.info-section p,.info-section li { color:var(--ink-light); font-size:.9rem; line-height:1.55; }
        .info-section ul { display:grid; gap:7px; list-style:none; }.info-section li { display:flex; gap:7px; }.info-section li i { color:#246b5a; margin-top:4px; }.info-wide { grid-column:1 / -1; }
        .info-contact { margin-top:18px; color:var(--ink-faded); font-size:.88rem; }.info-contact a { color:#246b5a; text-decoration:underline; font-weight:700; }
        @media (max-width:600px) { .info-book { width:100%; height:94svh; grid-template-columns:1fr; grid-template-rows:auto 1fr; }.info-book-tabs { flex-direction:row; padding:9px; }.info-book-tabs button { grid-template-columns:auto auto; align-items:center; justify-items:start; padding:8px 13px; }.info-book-page > header { padding:18px 52px 16px 17px; }.info-book-scroll { padding:18px 17px 24px; }.info-grid { grid-template-columns:1fr; }.info-wide { grid-column:auto; } }
      `}</style>
    </section>
  </div>;
}

function AboutContent() {
  return <><span className="info-version"><i className="bx bx-purchase-tag" /> Recallify V1.2.1</span><p className="info-lead">Recallify turns pasted quiz text into focused, shuffled study sessions. Use it as a guest, or create an account when you want your decks on every device.</p><div className="info-grid">
    <section className="info-section"><h3><i className="bx bx-book-open" /> Create</h3><p>Paste multiple-choice or identification questions, preview them, and save up to 7 active decks.</p></section>
    <section className="info-section"><h3><i className="bx bx-brain" /> Practice</h3><p>Shuffle questions, adjust the timer, hide A/B/C/D labels, and review mistakes after a round.</p></section>
    <section className="info-section"><h3><i className="bx bx-cloud" /> Sync</h3><p>Accounts are optional. Signed-in learners can use the same decks and progress across devices.</p></section>
    <section className="info-section"><h3><i className="bx bx-share-alt" /> Share</h3><p>Public links let friends study a deck and save their own copy, including your deck notes.</p></section>
  </div><p className="info-contact">Built by <a href="https://github.com/Tsarles" target="_blank" rel="noopener noreferrer">@Tsarles2026</a>.</p></>;
}

function TermsContent() {
  return <><span className="info-version"><i className="bx bx-calendar" /> Updated September 2026</span><p className="info-lead">Here is what happens to your content in practical terms.</p><div className="info-grid">
    <section className="info-section info-wide"><h3><i className="bx bx-data" /> Your data</h3><ul><li><i className="bx bx-check" /> Guest decks and scores stay in this browser.</li><li><i className="bx bx-check" /> Account email, profile, decks, and scores are stored through Supabase so they can sync.</li><li><i className="bx bx-check" /> You are responsible for quiz content you add.</li></ul></section>
    <section className="info-section"><h3><i className="bx bx-lock-alt" /> Sharing</h3><p>Decks are private by default. A shared deck can be opened by anyone with its link until its owner turns sharing off.</p></section>
    <section className="info-section"><h3><i className="bx bx-message-detail" /> Suggestions</h3><p>Feedback submitted in the app is sent to the developer and used to improve Recallify.</p></section>
    <section className="info-section info-wide"><h3><i className="bx bx-file" /> Use of the service</h3><p>Recallify is provided free of charge and as-is. These terms may be updated as the application changes; continued use means you accept the current version.</p></section>
  </div><p className="info-contact">Questions? Contact <a href="https://github.com/Tsarles" target="_blank" rel="noopener noreferrer">@Tsarles2026 on GitHub</a>.</p></>;
}

export default function Footer({ onSuggest }) {
  const [panel, setPanel] = useState(null);
  return <footer className="app-footer"><div className="footer-inner"><div className="footer-brand"><div className="footer-logo-row"><img src="/logo.png" alt="" className="footer-logo-img" /><span className="footer-logo">Recallify</span></div><p className="footer-tagline"><i className="bx bx-pencil" /> Study smarter, not harder</p></div><nav className="footer-links" aria-label="Footer links">
    <button className="footer-link" onClick={onSuggest}><i className="bx bx-message-detail" /> Suggestions</button><button className="footer-link" onClick={() => setPanel('about')}><i className="bx bx-info-circle" /> About</button><button className="footer-link" onClick={() => setPanel('terms')}><i className="bx bx-file" /> Terms</button><a href="https://github.com/Tsarles" target="_blank" rel="noopener noreferrer" className="footer-link footer-github"><i className="bx bxl-github" /> @Tsarles2026</a>
  </nav></div><div className="footer-bottom"><p><i className="bx bx-copyright" /> 2026 Recallify · V1.2.1 · Guest or synced account mode</p></div>{panel && <InfoModal initialPanel={panel} onClose={() => setPanel(null)} />}<style>{`
    .app-footer { background:#fff; border-top:2.5px solid var(--ink); margin-top:auto; }.footer-inner { max-width:900px; margin:0 auto; padding:25px 24px 18px; display:flex; align-items:flex-start; justify-content:space-between; gap:20px; flex-wrap:wrap; }
    .footer-logo-row,.footer-tagline,.footer-links,.footer-link { display:flex; align-items:center; }.footer-logo-row { gap:8px; }.footer-logo-img { width:28px; height:28px; object-fit:contain; }.footer-logo { font:700 1.4rem var(--font-display); }.footer-tagline { gap:5px; color:var(--ink-faded); font-size:.88rem; }
    .footer-links { gap:6px; flex-wrap:wrap; }.footer-link { gap:6px; padding:6px 13px; border:1.5px solid var(--border); border-radius:99px; background:transparent; color:var(--ink-light); cursor:pointer; text-decoration:none; font:.9rem var(--font-body); }.footer-link:hover { border-color:var(--ink); background:var(--paper-dark); }.footer-github { border-color:var(--ink); font-weight:700; }
    .footer-bottom { padding:11px 20px; border-top:1.5px dashed var(--border); text-align:center; color:var(--ink-faded); font-size:.8rem; }@media (max-width:480px) { .footer-inner { padding:20px 16px; }.footer-link { font-size:.8rem; padding:5px 9px; } }
  `}</style></footer>;
}
