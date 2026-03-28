export default function RevealButton({ answer, reveals, setReveals, revealed, setRevealed }) {
  const canReveal = reveals > 0 && !revealed;

  const handleReveal = () => {
    if (!canReveal) return;
    setReveals((r) => r - 1);
    setRevealed(true);
  };

  return (
    <div className="reveal-wrap">
      <button
        id="btn-reveal"
        className={`btn-sketch ${revealed ? 'success' : ''}`}
        onClick={handleReveal}
        disabled={!canReveal}
        title={reveals === 0 ? 'No reveals left!' : `${reveals} reveals remaining`}
      >
        {revealed ? (
          <>
            <i className="bx bx-show" />
            Answer: <strong>{answer}</strong>
          </>
        ) : (
          <>
            <i className="bx bx-hide" />
            Reveal Answer
          </>
        )}
      </button>

      <div className="reveal-dots" title={`${reveals} / 3 reveals left`}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`reveal-dot ${i < reveals ? 'active' : 'used'}`}
          />
        ))}
        <span className="reveal-count">{reveals} left</span>
      </div>

      <style>{`
        .reveal-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .reveal-dots {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .reveal-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 2px solid var(--ink);
          transition: background 0.2s;
        }

        .reveal-dot.active { background: var(--purple); }
        .reveal-dot.used   { background: var(--paper-cream); }

        .reveal-count {
          font-family: var(--font-sketch);
          font-size: 0.9rem;
          color: var(--ink-faded);
          margin-left: 4px;
        }
      `}</style>
    </div>
  );
}
