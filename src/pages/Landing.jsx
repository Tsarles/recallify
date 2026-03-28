import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import FoldableNote from '../components/FoldableNote';
import SuggestionModal from '../components/SuggestionModal';
import Footer from '../components/Footer';
import { hasHearted, setHearted } from '../utils/storage';
import { getCount, incrementCount } from '../utils/counter';

gsap.registerPlugin(ScrollTrigger);

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

export default function Landing({ onGetStarted }) {
  const notesRef   = useRef(null);
  const stepsRef   = useRef(null);
  const featRef    = useRef(null);
  const [hearts,   setHearts]       = useState(0);
  const [visitors, setVisitors]     = useState(0);
  const [hearted,  setLocalHearted] = useState(() => hasHearted());
  const [showSuggest, setShowSuggest] = useState(false);

  // ── Load + auto-increment visitor count on mount ───────────
  useEffect(() => {
    // Increment visitor on every landing page load
    incrementCount('visitors').then(v => { if (v !== null) setVisitors(v); });
    // Just read the heart count (don't increment)
    getCount('hearts').then(h => setHearts(h));
  }, []);

  // ── GSAP ScrollTrigger (only for below-fold sections) ──────
  useEffect(() => {
    // Notes stagger
    const noteCards = notesRef.current?.querySelectorAll('.sticky-note') || [];
    noteCards.forEach((el, i) => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
        opacity: 0, y: 40, rotate: 0,
        duration: 0.55, delay: i * 0.08, ease: 'back.out(1.6)',
        clearProps: 'all',
      });
    });

    // Steps stagger
    const stepCards = stepsRef.current?.querySelectorAll('.step-card') || [];
    stepCards.forEach((el, i) => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
        opacity: 0, y: 50,
        duration: 0.5, delay: i * 0.12, ease: 'power3.out',
        clearProps: 'all',
      });
    });

    // Feature chips
    const chips = featRef.current?.querySelectorAll('.feat-chip') || [];
    chips.forEach((el, i) => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' },
        opacity: 0, scale: 0.8,
        duration: 0.35, delay: i * 0.04, ease: 'back.out(2)',
        clearProps: 'all',
      });
    });

    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);

  const handleHeart = async () => {
    if (hearted) return;
    // Optimistically update UI
    setLocalHearted(true);
    setHearted(); // persist to localStorage so they can't re-heart on this device
    // Increment server-side counter
    const newCount = await incrementCount('hearts');
    if (newCount !== null) {
      setHearts(newCount);
    } else {
      // Fallback: just add 1 locally if API is down
      setHearts(h => h + 1);
    }
    gsap.fromTo('.heart-btn', { scale: 1 }, { scale: 1.4, yoyo: true, repeat: 1, duration: 0.2 });
  };

  return (
    <div className="landing">

      {/* ══════════════════════════════════════════════════════
          HERO — full viewport, CSS animated (never invisible)
          ══════════════════════════════════════════════════════ */}
      <section className="lnd-hero">
        {/* Background blobs */}
        <div className="hero-blob blob-yellow" />
        <div className="hero-blob blob-pink" />
        <div className="hero-blob blob-blue" />

        <div className="lnd-hero-inner">
          {/* Tag */}
          <div className="hero-tag hero-anim-0">
            <i className="bx bxs-pencil" />
            No sign-up &nbsp;·&nbsp; No fuss &nbsp;·&nbsp; Just study
          </div>

          {/* Title */}
          <h1 className="hero-title hero-anim-1">
            Paste quiz text.<br />
            <span className="hero-hl">Start studying.</span>
          </h1>

          {/* Desc */}
          <p className="hero-desc hero-anim-2">
            Ask ChatGPT to generate a quiz, paste it here, and Recallify turns it into
            an interactive deck — with timers, scoring & review. <strong>Up to 5 decks. Always free.</strong>
          </p>

          {/* Stats row - hearts + visitors */}
          <div className="hero-stats hero-anim-3">
            <button
              id="btn-heart"
              className={`stat-pill heart-btn ${hearted ? 'hearted' : ''}`}
              onClick={handleHeart}
              title={hearted ? 'Already loved! ❤' : 'Show some love!'}
            >
              <i className={`bx ${hearted ? 'bxs-heart' : 'bx-heart'}`} />
              <span>{hearts === 0 ? 'Be the first!' : `${hearts} ${hearts === 1 ? 'heart' : 'hearts'}`}</span>
            </button>
            <div className="stat-pill visitors" title="Total visitors">
              <i className="bx bx-show" />
              <span>{visitors === 0 ? '...' : `${visitors.toLocaleString()} ${visitors === 1 ? 'visitor' : 'visitors'}`}</span>
            </div>
          </div>

          {/* Big CTA */}
          <div className="hero-anim-4">
            <button id="btn-get-started" className="btn-sketch primary hero-cta" onClick={onGetStarted}>
              <i className="bx bx-play-circle" /> Get Started — Free
            </button>
          </div>

          {/* Suggest */}
          <div className="hero-anim-4">
            <button
              id="btn-suggest-landing"
              className="btn-sketch suggest-sticky-btn"
              onClick={() => setShowSuggest(true)}
            >
              <i className="bx bx-message-square-add" /> Leave a Suggestion
            </button>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="hero-scroll-hint hero-anim-4">
          <i className="bx bx-chevrons-down" />
        </div>
      </section>

      <hr className="doodle-divider" />

      {/* ══════════════════════════════════════════════════════
          HOW IT WORKS
          ══════════════════════════════════════════════════════ */}
      <section className="lnd-section lnd-steps" ref={stepsRef}>
        <div className="lnd-section-inner">
          <div className="section-eyebrow">
            <i className="bx bx-info-circle" /> Simple 3-step process
          </div>
          <h2 className="section-title">How it works</h2>
          <div className="steps-row">
            {[
              { n:'1', icon:'bxs-copy-alt',  color:'yellow', title:'Copy from AI',  desc:'Ask ChatGPT or any AI to make a quiz. Copy the text output.' },
              { n:'2', icon:'bx-paste',       color:'blue',   title:'Paste & Parse', desc:'Paste into Recallify. All questions detected automatically.' },
              { n:'3', icon:'bxs-graduation', color:'green',  title:'Quiz & Score',  desc:'Start the timed quiz, see your score, review every wrong answer.' },
            ].map(s => (
              <div key={s.n} className={`step-card sketch-card step-${s.color}`}>
                <div className="step-badge">{s.n}</div>
                <i className={`bx ${s.icon} step-icon`} />
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="doodle-divider" />

      {/* ══════════════════════════════════════════════════════
          STICKY NOTES — click to learn more
          ══════════════════════════════════════════════════════ */}
      <section className="lnd-section lnd-notes" ref={notesRef}>
        <div className="lnd-section-inner">
          <div className="section-eyebrow">
            <i className="bx bx-mouse-alt" /> Interactive notes
          </div>
          <h2 className="section-title">
            Click a note to learn more
            <i className="bx bx-down-arrow-circle section-title-icon" />
          </h2>
          <div className="notes-row">
            <FoldableNote color="yellow" title="Format Guide"    titleIcon="bx-clipboard"  preview="How to format your pasted quiz text." rotate={-2}>
              <p>Paste quiz questions in this format:</p>
              <pre>{FORMAT_EXAMPLE}</pre>
              <ul style={{ marginTop: 12 }}>
                <li>Questions must end with <code>?</code></li>
                <li>Options: <code>A.</code> or <code>A)</code></li>
                <li>Answer: <code>// correct answer C</code></li>
              </ul>
            </FoldableNote>

            <FoldableNote color="green" title="What's Supported" titleIcon="bx-check-shield" preview="All the input formats Recallify understands." rotate={1.5}>
              <ul>
                <li>Numbered questions (<code>1.</code> or <code>1)</code>)</li>
                <li>Unnumbered questions (ends with <code>?</code>)</li>
                <li>A. or A) option styles</li>
                <li>Up to 35+ questions at once</li>
                <li>Identification cards (no options)</li>
                <li>Mixed question types in one deck</li>
              </ul>
            </FoldableNote>

            <FoldableNote color="blue" title="Features"          titleIcon="bx-star"       preview="Timer, scoring, reveal, archive & more." rotate={-1}>
              <ul>
                <li><i className="bx bx-time" /> Adjustable per-card timer (10s–60s or custom)</li>
                <li><i className="bx bx-hide" /> Reveal answer up to 3× per quiz</li>
                <li><i className="bx bx-bar-chart-alt-2" /> Score tracking & wrong-answer review</li>
                <li><i className="bx bx-shuffle" /> Shuffled questions every round</li>
                <li><i className="bx bx-archive" /> Archive decks (auto-delete after 30 days)</li>
                <li><i className="bx bx-pencil" /> Edit your decks anytime</li>
              </ul>
            </FoldableNote>

            <FoldableNote color="pink" title="AI Prompt Tip"     titleIcon="bx-bulb"       preview="The best prompt to use with ChatGPT." rotate={2}>
              <p>Try this prompt in ChatGPT:</p>
              <pre style={{ marginTop: 10 }}>{`Generate 20 multiple-choice questions about [topic]. 
Format each as:

1. Question here?
A. Option one
B. Option two
C. Option three
D. Option four
// correct answer B`}</pre>
              <p style={{ marginTop: 10 }}>Then paste the result directly into Recallify!</p>
            </FoldableNote>
          </div>
        </div>
      </section>

      <hr className="doodle-divider" />

      {/* ══════════════════════════════════════════════════════
          FEATURES GRID
          ══════════════════════════════════════════════════════ */}
      <section className="lnd-section lnd-features" ref={featRef}>
        <div className="lnd-section-inner">
          <div className="section-eyebrow">
            <i className="bx bxs-rocket" /> What's included in V1
          </div>
          <h2 className="section-title">Everything you need</h2>
          <div className="feat-grid">
            {[
              ['bx-collection',     'Up to 5 decks'],
              ['bx-time',           'Per-card timer'],
              ['bxs-star',          'Score tracking'],
              ['bx-hide',           '3 answer reveals'],
              ['bx-shuffle',        'Shuffled every round'],
              ['bx-history',        'Review wrong answers'],
              ['bx-pencil',         'ID card mode'],
              ['bx-user-x',         'Zero sign-up'],
              ['bx-archive',        '30-day archive'],
              ['bxs-edit',          'Edit decks anytime'],
              ['bx-devices',        'Works on any device'],
              ['bx-lock',           '100% local data'],
            ].map(([icon, label]) => (
              <div key={label} className="feat-chip">
                <i className={`bx ${icon}`} /> {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="doodle-divider" />

      <Footer onSuggest={() => setShowSuggest(true)} />

      {/* Suggestion Modal via portal */}
      {showSuggest && createPortal(
        <SuggestionModal onClose={() => setShowSuggest(false)} />,
        document.body
      )}

      <style>{`
        /* ── Landing shell ────────────────────────────────── */
        .landing { display: flex; flex-direction: column; }

        /* ── Hero ────────────────────────────────────────── */
        .lnd-hero {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: calc(100svh - 64px);
          padding: 60px 24px 80px;
          overflow: hidden;
          text-align: center;
        }

        /* Subtle coloured blobs in background */
        .hero-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(70px);
          opacity: 0.35;
          pointer-events: none;
          animation: heroFadeIn 1s ease 0.3s both;
        }
        .blob-yellow { width: 420px; height: 340px; background: var(--yellow); top: -60px; left: -100px; }
        .blob-pink   { width: 360px; height: 300px; background: var(--pink);   bottom: -40px; right: -80px; }
        .blob-blue   { width: 300px; height: 260px; background: var(--blue);   top: 50%; left: 60%; transform: translate(-50%,-50%); }

        .lnd-hero-inner {
          position: relative;
          z-index: 1;
          max-width: 660px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 22px;
        }

        .hero-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-display);
          font-size: 0.95rem;
          font-weight: 600;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(8px);
          border: 2px solid var(--yellow);
          border-radius: 99px;
          padding: 6px 20px;
          box-shadow: 2px 2px 0 var(--ink);
          color: var(--ink);
        }

        .hero-title {
          font-size: clamp(2.4rem, 6vw, 4rem);
          line-height: 1.12;
          margin: 0;
          color: var(--ink);
        }
        .hero-hl {
          background: var(--yellow);
          padding: 2px 14px;
          border-radius: 8px;
          display: inline-block;
          transform: rotate(-0.7deg);
          box-shadow: 3px 3px 0 rgba(0,0,0,0.1);
        }

        .hero-desc {
          font-size: 1.1rem;
          color: var(--ink-light);
          line-height: 1.7;
          max-width: 540px;
          margin: 0;
        }

        .hero-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
          align-items: center;
        }
        .hero-cta {
          font-size: 1.1rem;
          padding: 13px 30px;
          animation: pulse-shadow 2.5s ease infinite;
        }

        /* Stats row (hearts + visitors) */
        .hero-stats {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
          align-items: center;
        }
        .stat-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-family: var(--font-display);
          font-size: 0.95rem;
          font-weight: 600;
          padding: 8px 18px;
          border-radius: 99px;
          border: 2px solid var(--border);
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(6px);
          box-shadow: 2px 2px 0 rgba(30,26,20,0.1);
          color: var(--ink);
          cursor: default;
          transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
        }
        /* Heart button is interactive */
        button.stat-pill {
          cursor: pointer;
        }
        button.stat-pill:hover:not(.hearted) {
          border-color: var(--wrong);
          background: var(--wrong-bg);
          box-shadow: 2px 2px 0 var(--wrong);
        }
        button.stat-pill i { color: var(--wrong); font-size: 1rem; }
        button.stat-pill.hearted {
          border-color: var(--wrong);
          background: var(--wrong-bg);
        }
        .stat-pill.visitors i { color: var(--blue); font-size: 1rem; }
        .stat-pill.visitors { cursor: default; }

        .suggest-sticky-btn {
          border-color: var(--purple);
          color: var(--purple);
          font-size: 0.9rem;
          padding: 7px 18px;
          border-style: dashed;
        }
        .suggest-sticky-btn:hover {
          background: var(--purple-bg);
          box-shadow: 3px 3px 0 var(--purple);
          border-style: solid;
        }

        .hero-scroll-hint {
          position: absolute;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          color: var(--ink-faded);
          font-size: 1.6rem;
          animation: bounceDown 2s ease infinite;
        }
        @keyframes bounceDown {
          0%,100% { transform: translateX(-50%) translateY(0); }
          50%      { transform: translateX(-50%) translateY(8px); }
        }

        /* ── Section shared ───────────────────────────────── */
        .lnd-section {
          padding: 72px 24px;
        }
        .lnd-section-inner {
          max-width: 960px;
          margin: 0 auto;
          width: 100%;
        }

        .section-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-display);
          font-size: 0.88rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--purple);
          background: var(--purple-bg);
          border: 1.5px solid var(--purple);
          border-radius: 99px;
          padding: 4px 14px;
          margin-bottom: 16px;
        }

        .section-title {
          font-size: clamp(1.8rem, 4vw, 2.4rem);
          text-align: center;
          margin: 0 0 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .section-title-icon {
          font-size: 1.6rem;
          color: var(--purple);
        }
        .lnd-section { text-align: center; }

        /* ── Steps ────────────────────────────────────────── */
        .steps-row {
          display: flex;
          gap: 22px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .step-card {
          flex: 1 1 240px;
          max-width: 290px;
          padding: 30px 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .step-yellow { background: var(--yellow-bg); }
        .step-blue   { background: var(--blue-bg); }
        .step-green  { background: var(--green-bg); }
        .step-badge {
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 700;
          width: 52px; height: 52px;
          border-radius: 50%;
          background: #fff;
          border: 2.5px solid var(--ink);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 3px 3px 0 var(--ink);
        }
        .step-icon { font-size: 1.9rem; color: var(--ink-light); }
        .step-title { font-size: 1.15rem; margin: 0; }
        .step-desc { font-size: 0.92rem; color: var(--ink-light); line-height: 1.6; margin: 0; }

        /* ── Notes ────────────────────────────────────────── */
        .notes-row {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .notes-row .sticky-note {
          flex: 1 1 200px;
          max-width: 230px;
          min-width: 170px;
          cursor: pointer;
        }

        /* ── Features ─────────────────────────────────────── */
        .feat-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
          max-width: 760px;
          margin: 0 auto;
        }
        .feat-chip {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 0.97rem;
          font-weight: 500;
          padding: 9px 18px;
          border: 2px solid var(--ink);
          border-radius: 99px;
          background: #fff;
          box-shadow: 2px 2px 0 var(--ink);
          white-space: nowrap;
          transition: transform 0.1s, box-shadow 0.1s;
        }
        .feat-chip:hover {
          transform: translate(-1px,-1px);
          box-shadow: 3px 3px 0 var(--ink);
        }
        .feat-chip i { color: var(--purple); }

        /* ── Responsive ───────────────────────────────────── */
        @media (max-width: 640px) {
          .lnd-hero { min-height: calc(100svh - 56px); padding: 40px 16px 60px; }
          .hero-title { font-size: 2rem; }
          .hero-desc  { font-size: 1rem; }
          .lnd-section { padding: 48px 16px; }
          .notes-row .sticky-note { max-width: 100%; }
          .blob-yellow, .blob-pink, .blob-blue { opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}
