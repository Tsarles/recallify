import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';

/**
 * SuggestionModal — sticky-note styled modal
 * Sends to Formspree: https://formspree.io/f/xgopolab
 */
export default function SuggestionModal({ onClose }) {
  const overlayRef = useRef(null);
  const cardRef    = useRef(null);
  const [msg,    setMsg]    = useState('');
  const [name,   setName]   = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error

  useEffect(() => {
    gsap.fromTo(overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.25, ease: 'power2.out' }
    );
    gsap.fromTo(cardRef.current,
      { opacity: 0, scale: 0.8, rotate: -5, y: 40 },
      { opacity: 1, scale: 1, rotate: -1.5, y: 0, duration: 0.45, ease: 'back.out(1.8)' }
    );
  }, []);

  const handleClose = () => {
    gsap.to(cardRef.current, { opacity: 0, scale: 0.85, rotate: -6, y: 20, duration: 0.22, ease: 'power2.in' });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.24, onComplete: onClose });
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) handleClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!msg.trim()) return;
    setStatus('sending');
    try {
      const res = await fetch('https://formspree.io/f/xgopolab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name: name || 'Anonymous', message: msg }),
      });
      if (res.ok) {
        setStatus('sent');
        gsap.fromTo(cardRef.current,
          { scale: 1 },
          { scale: 1.05, yoyo: true, repeat: 1, duration: 0.2, ease: 'power2.inOut' }
        );
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div ref={overlayRef} className="modal-overlay sug-overlay" onClick={handleOverlayClick}>
      <div ref={cardRef} className="sug-note">
        {/* Tape strip */}
        <div className="sug-tape" />
        {/* Pin icon instead of emoji */}
        <div className="sug-pin">
          <i className="bx bxs-pin" />
        </div>

        <button className="sug-close" onClick={handleClose} aria-label="Close">
          <i className="bx bx-x" />
        </button>

        <h3 className="sug-title">
          <i className="bx bx-bulb" /> Got an idea?
        </h3>
        <p className="sug-sub">Drop your suggestion — I read every one!</p>

        {status === 'sent' ? (
          <div className="sug-sent">
            <i className="bx bxs-check-circle sug-sent-icon" />
            <p>Thanks! Suggestion received!</p>
            <button className="btn-sketch sm" onClick={handleClose}>
              <i className="bx bx-check" /> Close
            </button>
          </div>
        ) : (
          <form className="sug-form" onSubmit={handleSubmit}>
            <input
              id="sug-name"
              className="sketch-input"
              placeholder="Your name (optional)"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <textarea
              id="sug-message"
              className="sketch-textarea"
              rows={4}
              placeholder="e.g. Add dark mode, spaced repetition, import from CSV…"
              value={msg}
              onChange={e => setMsg(e.target.value)}
              required
            />
            {status === 'error' && (
              <p className="sug-error">
                <i className="bx bx-error-circle" /> Failed to send — try again!
              </p>
            )}
            <div className="sug-actions">
              <button
                id="btn-send-sug"
                type="submit"
                className="btn-sketch primary"
                disabled={status === 'sending' || !msg.trim()}
              >
                {status === 'sending'
                  ? <><i className="bx bx-loader-alt bx-spin" /> Sending…</>
                  : <><i className="bx bx-send" /> Send it!</>}
              </button>
              <button type="button" className="btn-sketch sm" onClick={handleClose}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <style>{`
        .sug-overlay { z-index: 1100; }
        .sug-note {
          position: relative;
          width: min(460px, 92vw);
          padding: 52px 28px 28px;
          background: var(--sticky-1);
          border-radius: 3px 4px 3px 4px / 4px 3px 4px 3px;
          box-shadow:
            4px 4px 0 rgba(0,0,0,0.12),
            0 8px 32px rgba(30,26,20,0.2),
            inset 0 -4px 0 rgba(0,0,0,0.07);
          border: 1.5px solid rgba(30,26,20,0.15);
        }
        .sug-note::after {
          content: '';
          position: absolute;
          bottom: 0; right: 0;
          width: 0; height: 0;
          border-style: solid;
          border-width: 0 0 28px 28px;
          border-color: transparent transparent rgba(0,0,0,0.14) transparent;
        }
        .sug-tape {
          position: absolute;
          top: -10px; left: 50%;
          transform: translateX(-50%) rotate(-1deg);
          width: 80px; height: 22px;
          background: rgba(255,255,255,0.55);
          border-left: 1px solid rgba(0,0,0,0.08);
          border-right: 1px solid rgba(0,0,0,0.08);
          box-shadow: 0 1px 3px rgba(0,0,0,0.10);
          z-index: 2;
        }
        .sug-pin {
          position: absolute;
          top: 12px; left: 50%;
          transform: translateX(-50%);
          font-size: 1.4rem;
          color: var(--wrong);
          z-index: 3;
          filter: drop-shadow(0 2px 3px rgba(0,0,0,0.25));
        }
        .sug-close {
          position: absolute;
          top: 10px; right: 10px;
          background: rgba(0,0,0,0.08);
          border: none; border-radius: 50%;
          width: 30px; height: 30px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 1.1rem; color: var(--ink);
          transition: background 0.15s; z-index: 2;
        }
        .sug-close:hover { background: rgba(0,0,0,0.15); }
        .sug-title {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 6px;
          color: var(--ink);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .sug-title i { color: var(--purple); }
        .sug-sub {
          font-size: 0.9rem;
          color: var(--ink-light);
          margin-bottom: 16px;
        }
        .sug-form { display: flex; flex-direction: column; gap: 12px; }
        .sug-error {
          color: var(--wrong); font-size: 0.9rem;
          display: flex; align-items: center; gap: 6px;
        }
        .sug-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
        .sug-sent {
          display: flex; flex-direction: column;
          align-items: center; gap: 12px;
          padding: 16px 0;
          font-family: var(--font-display);
          font-size: 1.1rem; text-align: center;
        }
        .sug-sent-icon {
          font-size: 2.8rem;
          color: var(--correct);
          animation: bounceIn 0.4s ease;
        }
      `}</style>
    </div>
  );
}
