import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';

/**
 * FoldableNote — sticky note card.
 * The expanded modal is rendered via createPortal into document.body
 * so it's never constrained by the parent .notes-row CSS.
 */
export default function FoldableNote({ color = 'yellow', title, titleIcon, preview, children, rotate = 0 }) {
  const [open, setOpen] = useState(false);
  const noteRef    = useRef(null);
  const overlayRef = useRef(null);
  const modalRef   = useRef(null);

  // Hover lift effect on the small card
  const handleHoverIn = () => {
    gsap.to(noteRef.current, {
      y: -7, rotate: rotate * 0.3,
      boxShadow: '6px 8px 20px rgba(30,26,20,0.16)',
      duration: 0.22, ease: 'power2.out',
    });
  };
  const handleHoverOut = () => {
    gsap.to(noteRef.current, {
      y: 0, rotate,
      boxShadow: '3px 4px 10px rgba(30,26,20,0.10)',
      duration: 0.28, ease: 'power2.inOut',
    });
  };

  // Open modal
  const handleOpen = () => {
    setOpen(true);
  };

  // After modal mounts, animate in
  useEffect(() => {
    if (open && overlayRef.current && modalRef.current) {
      gsap.fromTo(overlayRef.current,
        { opacity: 0 }, { opacity: 1, duration: 0.22 }
      );
      gsap.fromTo(modalRef.current,
        { opacity: 0, scale: 0.88, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.38, ease: 'back.out(1.6)' }
      );
    }
  }, [open]);

  const handleClose = () => {
    if (!overlayRef.current || !modalRef.current) { setOpen(false); return; }
    gsap.to(modalRef.current, {
      opacity: 0, scale: 0.9, y: 20,
      duration: 0.22, ease: 'power2.in',
    });
    gsap.to(overlayRef.current, {
      opacity: 0, duration: 0.25, onComplete: () => setOpen(false),
    });
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) handleClose();
  };

  return (
    <>
      {/* ── Small sticky card ─────────────────────────────── */}
      <div
        ref={noteRef}
        className={`sticky-note foldable ${color}`}
        style={{ transform: `rotate(${rotate}deg)`, cursor: 'pointer' }}
        onClick={handleOpen}
        onMouseEnter={handleHoverIn}
        onMouseLeave={handleHoverOut}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && handleOpen()}
        aria-label={`Open note: ${title}`}
      >
        <div className="fn-title">
          {titleIcon && <i className={`bx ${titleIcon} fn-title-icon`} />}
          {title}
        </div>
        <p className="fn-preview">{preview}</p>
        <div className="fn-click-hint">
          <i className="bx bx-expand-alt" /> Click to expand
        </div>
      </div>

      {/* ── Expanded modal — rendered via portal into body ── */}
      {open && createPortal(
        <div
          ref={overlayRef}
          className="modal-overlay fn-overlay"
          onClick={handleOverlayClick}
        >
          <div ref={modalRef} className={`fn-modal sticky-note ${color}`}>
            <button className="fn-close" onClick={handleClose} aria-label="Close">
              <i className="bx bx-x" />
            </button>

            {/* Fold corner indicator */}
            <div className="fn-modal-header">
              {titleIcon && <i className={`bx ${titleIcon} fn-modal-icon`} />}
              <h2 className="fn-modal-title">{title}</h2>
            </div>

            <div className="fn-modal-body">
              {children}
            </div>
          </div>
        </div>,
        document.body
      )}

      <style>{`
        /* Small card styles */
        .fn-title {
          font-family: var(--font-display);
          font-size: 1rem; font-weight: 700;
          margin-bottom: 8px;
          display: flex; align-items: center; gap: 6px;
          color: var(--ink);
        }
        .fn-title-icon { color: var(--ink-light); font-size: 0.95rem; }
        .fn-preview {
          font-size: 0.87rem; color: var(--ink-light);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 3; -webkit-box-orient: vertical;
          overflow: hidden; margin: 0;
        }
        .fn-click-hint {
          font-size: 0.75rem; color: var(--ink-faded);
          margin-top: 12px; opacity: 0.7;
          display: flex; align-items: center; gap: 4px;
          font-weight: 500;
        }
        .fn-click-hint i { font-size: 0.8rem; }

        /* Modal overlay (z-index: 9000 so it covers everything) */
        .fn-overlay {
          z-index: 9000 !important;
        }

        /* The actual modal card */
        .fn-modal {
          /* Override ALL width constraints — portal renders into body */
          width: min(680px, 92vw) !important;
          max-width: min(680px, 92vw) !important;
          min-width: min(420px, 90vw) !important;
          flex: none !important;
          padding: 44px 36px 32px !important;
          max-height: 85vh;
          overflow-y: auto;
          box-shadow:
            6px 8px 0 rgba(0,0,0,0.12),
            0 16px 48px rgba(30,26,20,0.22) !important;
          position: relative;
        }

        .fn-close {
          position: absolute; top: 12px; right: 12px;
          background: rgba(0,0,0,0.10); border: none;
          border-radius: 50%; width: 34px; height: 34px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 1.2rem; color: var(--ink);
          transition: background 0.15s;
        }
        .fn-close:hover { background: rgba(0,0,0,0.18); }

        .fn-modal-header {
          display: flex; align-items: center;
          gap: 10px; margin-bottom: 18px;
        }
        .fn-modal-icon { font-size: 1.5rem; color: var(--purple); }
        .fn-modal-title {
          font-family: var(--font-display);
          font-size: 1.55rem; font-weight: 700;
          color: var(--ink); margin: 0;
        }

        .fn-modal-body {
          font-size: 0.97rem; line-height: 1.72;
          color: var(--ink-light);
        }
        .fn-modal-body p { margin-bottom: 10px; }
        .fn-modal-body ul {
          padding-left: 6px; margin: 8px 0;
          list-style: none; display: flex; flex-direction: column; gap: 6px;
        }
        .fn-modal-body li {
          display: flex; align-items: baseline; gap: 8px;
        }
        .fn-modal-body li i { color: var(--purple); flex-shrink: 0; font-size: 0.95rem; }
        .fn-modal-body code {
          background: rgba(0,0,0,0.09); padding: 2px 8px;
          border-radius: 4px; font-size: 0.9em; font-family: monospace;
        }
        .fn-modal-body pre {
          background: rgba(0,0,0,0.07); padding: 14px; border-radius: 10px;
          font-size: 0.85rem; white-space: pre-wrap; margin: 8px 0;
          font-family: monospace; line-height: 1.6;
          border: 1px solid rgba(0,0,0,0.1);
        }

        @media (max-width: 480px) {
          .fn-modal { padding: 36px 20px 24px !important; }
          .fn-modal-title { font-size: 1.25rem; }
        }
      `}</style>
    </>
  );
}
