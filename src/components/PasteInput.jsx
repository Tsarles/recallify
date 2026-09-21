import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { parseQuizText } from '../utils/parser';

const FORMAT_EXAMPLE = `1. What is the capital of France?
A. London
B. Berlin
C. Paris
D. Rome
// correct answer C

2. Which planet is closest to the Sun?
A. Earth
B. Mars
C. Venus
D. Mercury
// correct answer D`;

const TIMER_PRESETS = [
  { label: '10s', value: 10 },
  { label: '15s', value: 15 },
  { label: '20s', value: 20 },
  { label: '30s', value: 30 },
  { label: '45s', value: 45 },
  { label: '60s', value: 60 },
];

export default function PasteInput({ onCreateDeck }) {
  const [text,    setText]    = useState('');
  const [title,   setTitle]   = useState('');
  const [subject, setSubject] = useState('');
  const [timer,   setTimer]   = useState(20);
  const [custom,  setCustom]  = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [error,   setError]   = useState('');
  const [preview, setPreview] = useState(null);
  const pageRef = useRef(null);

  useEffect(() => {
    if (pageRef.current) {
      gsap.fromTo(pageRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }
      );
      // Animate sticky notes
      const notes = pageRef.current.querySelectorAll('.sticky-note');
      gsap.fromTo(notes,
        { opacity: 0, y: 18, rotate: 0 },
        { opacity: 1, y: 0, stagger: 0.08, duration: 0.45, ease: 'back.out(1.6)',
          onComplete: () => {
            // Restore their natural rotations after entrance
            notes.forEach((n, i) => {
              const rots = [-1.5, 1.2, -0.8];
              gsap.to(n, { rotate: rots[i] || 0, duration: 0.25, ease: 'power2.out' });
            });
          }
        }
      );
    }
  }, []);

  const handleParse = () => {
    setError('');
    if (!text.trim()) { setError('Please paste your quiz questions first!'); return; }
    if (!title.trim()) { setError('Give your deck a title!'); return; }
    const cards = parseQuizText(text);
    if (cards.length === 0) { setError("Hmm, couldn't find any questions. Check the format on the sticky note!"); return; }
    setPreview(cards);
    gsap.fromTo('.preview-panel', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' });
  };

  const handleConfirm = () => {
    if (!preview) return;
    const timerVal = useCustom ? (parseInt(custom, 10) || 20) : timer;
    onCreateDeck({ title, subject, cards: preview, timerSeconds: timerVal });
  };

  return (
    <div ref={pageRef} className="paste-page inner-page-wrap">
      {/* ── Format sticky notes ────────────────────────────── */}
      <div className="sticky-notes-row">
        <div className="sticky-note yellow">
          <div className="sticky-title"><i className="bx bx-info-circle" /> Format Guide</div>
          <p>Paste quiz text from ChatGPT or any AI. Questions must end with <strong>?</strong></p>
          <p style={{ marginTop: 6 }}>Mark the answer with:<br /><code>// correct answer C</code></p>
        </div>

        <div className="sticky-note green">
          <div className="sticky-title"><i className="bx bx-check-circle" /> Supported</div>
          <ul className="sticky-list">
            <li>A. or A) style options</li>
            <li>Numbered questions (1. or 1)</li>
            <li>1 to 35+ questions at once</li>
            <li>Identification cards (no A/B/C/D)</li>
          </ul>
        </div>

        <div className="sticky-note blue">
          <div className="sticky-title"><i className="bx bx-file" /> Example</div>
          <pre className="sticky-pre">{FORMAT_EXAMPLE.slice(0, 120)}…</pre>
        </div>
      </div>

      {/* ── Form ──────────────────────────────────────────── */}
      {!preview ? (
        <div className="paste-form sketch-card">
          <h2 className="paste-heading">
            <i className="bx bx-paste" /> Paste Your Quiz
          </h2>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Deck Title *</label>
              <input
                id="deck-title"
                className="sketch-input"
                placeholder="e.g. Science Midterms"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Subject / Tag</label>
              <input
                id="deck-subject"
                className="sketch-input"
                placeholder="e.g. Chemistry, History…"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
          </div>

          {/* Timer settings */}
          <div className="timer-settings-row">
            <label className="form-label">
              <i className="bx bx-time" /> Timer per card
            </label>
            <div className="timer-presets">
              {TIMER_PRESETS.map(p => (
                <button
                  key={p.value}
                  type="button"
                  className={`timer-preset-btn ${!useCustom && timer === p.value ? 'active' : ''}`}
                  onClick={() => { setTimer(p.value); setUseCustom(false); }}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="custom-timer-row">
              <input
                type="checkbox"
                id="paste-custom-timer"
                checked={useCustom}
                onChange={e => setUseCustom(e.target.checked)}
              />
              <label htmlFor="paste-custom-timer" className="custom-timer-label">Custom:</label>
              <input
                type="number"
                className="sketch-input custom-timer-input"
                min={5} max={300}
                placeholder="e.g. 25"
                value={custom}
                disabled={!useCustom}
                onChange={e => setCustom(e.target.value)}
              />
              <span className="timer-hint">seconds (5–300)</span>
            </div>
          </div>

          <label className="form-label" style={{ marginTop: 16 }}>
            Paste Quiz Text *
          </label>
          <textarea
            id="quiz-paste-area"
            className="sketch-textarea"
            rows={14}
            placeholder={FORMAT_EXAMPLE}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {error && (
            <div className="paste-error">
              <i className="bx bx-error-circle" /> {error}
            </div>
          )}

          <div className="paste-actions">
            <button id="btn-parse" className="btn-sketch primary" onClick={handleParse}>
              <i className="bx bx-magic-wand" /> Parse Questions
            </button>
          </div>
        </div>
      ) : (
        /* ── Preview ──────────────────────────────────────── */
        <div className="preview-panel sketch-card">
          <div className="preview-header">
            <h2 className="paste-heading">
              <i className="bx bx-check-shield" /> Found {preview.length} Questions!
            </h2>
            <span className="preview-badge">{title}</span>
          </div>

          <div className="preview-list">
            {preview.map((q, i) => (
              <div key={i} className="preview-item">
                <span className="preview-num">{i + 1}</span>
                <div className="preview-body">
                  <p className="preview-q">{q.question}</p>
                  {q.type === 'multiple-choice' && (
                    <div className="preview-opts">
                      {q.options.map((o) => (
                        <span
                          key={o.id}
                          className={`preview-opt ${o.id === q.answerId ? 'correct' : ''}`}
                        >
                          {o.id}. {o.text}
                          {o.id === q.answerId && (
                            <i className="bx bx-check" style={{ marginLeft: 4 }} />
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                  {q.type === 'identification' && (
                    <span className="preview-ident">Answer: {q.answerId}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="paste-actions">
            <button id="btn-back-edit" className="btn-sketch" onClick={() => setPreview(null)}>
              <i className="bx bx-arrow-back" /> Edit
            </button>
            <button id="btn-confirm-deck" className="btn-sketch primary" onClick={handleConfirm}>
              <i className="bx bxs-save" /> Save Deck ({preview.length} cards)
            </button>
          </div>
        </div>
      )}

      <style>{`
        .paste-page {
          max-width: 860px;
          margin: 0 auto;
          padding: 32px 20px 60px;
          width: 100%;
        }

        /* Sticky notes */
        .sticky-notes-row {
          display: flex;
          gap: 18px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }
        .sticky-notes-row .sticky-note {
          flex: 1 1 200px;
          min-width: 180px;
          font-size: 0.92rem;
        }

        .sticky-title {
          font-family: var(--font-display);
          font-size: 1.05rem;
          font-weight: 700;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .sticky-list {
          margin: 4px 0 0 0;
          padding-left: 18px;
          line-height: 1.7;
        }
        .sticky-pre {
          font-size: 0.78rem;
          margin: 0;
          white-space: pre-wrap;
          font-family: monospace;
          line-height: 1.5;
        }

        /* Form */
        .paste-form, .preview-panel {
          padding: 32px;
          animation: bounceIn 0.35s ease both;
        }
        .paste-heading {
          font-size: 1.7rem;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .form-row {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }
        .form-group {
          flex: 1 1 200px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-label {
          font-family: var(--font-display);
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--ink-light);
          display: flex;
          align-items: center;
          gap: 5px;
        }

        /* Timer settings */
        .timer-settings-row {
          margin-top: 18px;
          padding: 16px;
          background: var(--paper);
          border: 1.5px dashed var(--border);
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .timer-presets {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .timer-preset-btn {
          font-family: var(--font-display);
          font-size: 0.88rem;
          font-weight: 600;
          padding: 5px 14px;
          border: 2px solid var(--ink);
          border-radius: 99px;
          background: #fff;
          cursor: pointer;
          box-shadow: 2px 2px 0 var(--ink);
          transition: background 0.12s, transform 0.08s;
        }
        .timer-preset-btn:hover { transform: translate(-1px,-1px); box-shadow: 3px 3px 0 var(--ink); }
        .timer-preset-btn.active { background: var(--yellow); }
        .custom-timer-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .custom-timer-label {
          font-family: var(--font-display);
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
        }
        .custom-timer-input {
          width: 80px !important;
          padding: 6px 10px;
          font-size: 0.88rem;
        }
        .timer-hint {
          font-size: 0.8rem;
          color: var(--ink-faded);
        }

        .sketch-textarea {
          margin-top: 8px;
          min-height: 240px;
          line-height: 1.6;
        }
        .paste-error {
          margin-top: 12px;
          padding: 10px 14px;
          background: var(--wrong-bg);
          border: 2px solid var(--wrong);
          border-radius: 6px;
          color: var(--wrong);
          font-size: 1rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .paste-actions {
          display: flex;
          gap: 12px;
          margin-top: 20px;
          flex-wrap: wrap;
        }

        /* Preview */
        .preview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 20px;
        }
        .preview-badge {
          font-family: var(--font-display);
          font-size: 1rem;
          background: var(--yellow-bg);
          border: 2px solid var(--ink);
          border-radius: var(--r-btn);
          padding: 4px 14px;
          box-shadow: 2px 2px 0 var(--ink);
        }
        .preview-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 420px;
          overflow-y: auto;
          padding-right: 4px;
        }
        .preview-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding: 10px 14px;
          background: var(--paper);
          border: 1.5px solid var(--border);
          border-radius: 8px;
        }
        .preview-num {
          font-family: var(--font-display);
          font-size: 1.1rem;
          font-weight: 700;
          min-width: 28px;
          color: var(--purple);
        }
        .preview-body { flex: 1; }
        .preview-q {
          font-size: 0.97rem;
          color: var(--ink);
          margin-bottom: 6px;
        }
        .preview-opts {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .preview-opt {
          font-size: 0.82rem;
          padding: 2px 10px;
          border-radius: 20px;
          background: var(--paper-cream);
          border: 1px solid var(--border);
        }
        .preview-opt.correct {
          background: var(--correct-bg);
          border-color: var(--correct);
          color: var(--correct);
          font-weight: 600;
        }
        .preview-ident {
          font-size: 0.85rem;
          color: var(--purple);
          background: var(--purple-bg);
          padding: 2px 10px;
          border-radius: 20px;
        }

        @media (max-width: 560px) {
          .paste-form, .preview-panel { padding: 20px 16px; }
          .paste-heading { font-size: 1.4rem; }
          .timer-settings-row { padding: 12px; }
        }
      `}</style>
    </div>
  );
}
