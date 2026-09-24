import { useEffect } from 'react';

const EXAMPLE = `1. What is the capital of France?
A. London
B. Berlin
C. Paris
D. Rome
// correct answer C`;

export default function DeckGuideModal({ onClose }) {
  useEffect(() => {
    const closeOnEscape = (event) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return (
    <div className="modal-overlay guide-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="deck-guide sketch-card" role="dialog" aria-modal="true" aria-labelledby="deck-guide-title">
        <header className="deck-guide-header">
          <div><span className="guide-eyebrow">Quick guide</span><h2 id="deck-guide-title">Format quiz text in four steps</h2></div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close formatting guide"><i className="bx bx-x" /></button>
        </header>
        <nav className="guide-jumps" aria-label="Guide sections">
          <a href="#guide-copy">1. Prepare</a><a href="#guide-format">2. Format</a><a href="#guide-types">3. Check</a><a href="#guide-ready">4. Paste</a>
        </nav>
        <div className="deck-guide-scroll">
          <section id="guide-copy" className="guide-section"><span className="guide-number">1</span><div><h3>Prepare your questions</h3><p>Copy questions from your notes, document, or an AI tool. Each question should be numbered and multiple-choice questions should include their options.</p></div></section>
          <section id="guide-format" className="guide-section"><span className="guide-number">2</span><div><h3>Use this exact answer marker</h3><p>Place <code>// correct answer C</code> below the options. Change the letter to match the correct option.</p><pre>{EXAMPLE}</pre><button type="button" className="guide-copy" onClick={() => navigator.clipboard.writeText(EXAMPLE)}><i className="bx bx-copy" /> Copy example</button></div></section>
          <section id="guide-types" className="guide-section"><span className="guide-number">3</span><div><h3>Run a quick check</h3><ul><li><i className="bx bx-check" /> Options may use <strong>A.</strong> or <strong>A)</strong></li><li><i className="bx bx-check" /> Questions may start with <strong>1.</strong> or <strong>1)</strong></li><li><i className="bx bx-check" /> Identification questions can omit A/B/C/D options</li><li><i className="bx bx-x" /> Do not leave an option or answer marker blank</li></ul></div></section>
          <section id="guide-ready" className="guide-section guide-finish"><span className="guide-number"><i className="bx bx-flag" /></span><div><h3>Paste, preview, then save</h3><p>Recallify shows a preview before saving, so you can catch formatting mistakes. A/B/C/D labels remain hidden during quizzes unless you enable them.</p><button type="button" className="btn-sketch primary" onClick={onClose}>Got it — create my deck</button></div></section>
        </div>
        <style>{`
          .guide-overlay { padding:12px; }
          .deck-guide { width:min(720px,100%); max-height:min(88svh,760px); display:flex; flex-direction:column; overflow:hidden; background:#fff; }
          .deck-guide-header { position:relative; padding:24px 56px 18px 24px; border-bottom:2px solid var(--ink); background:var(--paper); }
          .deck-guide-header h2 { margin-top:3px; font-size:clamp(1.35rem,4vw,1.8rem); }
          .guide-eyebrow { color:var(--purple); font:700 .78rem var(--font-display); text-transform:uppercase; letter-spacing:.08em; }
          .guide-jumps { display:flex; gap:7px; padding:11px 18px; overflow-x:auto; border-bottom:1px dashed var(--border); background:#fff; }
          .guide-jumps a { flex:0 0 auto; padding:5px 10px; border:1px solid var(--border); border-radius:99px; font-size:.8rem; }
          .deck-guide-scroll { overflow-y:auto; scroll-behavior:smooth; padding:8px 24px 24px; }
          .guide-section { scroll-margin-top:10px; display:grid; grid-template-columns:38px 1fr; gap:14px; padding:22px 0; border-bottom:1.5px dashed var(--border); }
          .guide-number { width:34px; height:34px; display:grid; place-items:center; border:2px solid var(--ink); border-radius:50%; background:var(--yellow); box-shadow:2px 2px 0 var(--ink); font:700 .9rem var(--font-display); }
          .guide-section h3 { margin:3px 0 7px; font-size:1.1rem; }
          .guide-section p,.guide-section li { color:var(--ink-light); font-size:.93rem; }
          .guide-section ul { display:grid; gap:7px; list-style:none; }
          .guide-section li { display:flex; align-items:flex-start; gap:7px; }
          .guide-section li i { margin-top:4px; color:var(--correct); }
          .guide-section li .bx-x { color:var(--wrong); }
          .guide-section pre { margin:12px 0; padding:14px; overflow-x:auto; border:1.5px solid var(--border); border-radius:9px; background:var(--paper); font:.82rem/1.55 monospace; white-space:pre-wrap; }
          .guide-copy { display:inline-flex; align-items:center; gap:6px; padding:6px 10px; border:1.5px solid var(--ink); border-radius:7px; background:#fff; cursor:pointer; font:600 .82rem var(--font-body); }
          .guide-finish { border-bottom:0; }
          .guide-finish .btn-sketch { margin-top:14px; }
          @media (max-width:520px) { .deck-guide { max-height:94svh; } .deck-guide-header { padding:20px 50px 14px 18px; } .deck-guide-scroll { padding:4px 18px 18px; } .guide-section { grid-template-columns:32px 1fr; gap:10px; } .guide-number { width:30px; height:30px; } }
        `}</style>
      </section>
    </div>
  );
}
