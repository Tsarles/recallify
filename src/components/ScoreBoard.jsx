import { getQuizProgress } from '../utils/progress';

export default function ScoreBoard({ score, wrong, total }) {
  const { answered, remaining, progressPct, accuracyPct } = getQuizProgress(score, wrong, total);

  return (
    <div className="scoreboard">
      <div className="score-item score-correct">
        <i className="bx bxs-check-circle" />
        <span className="score-num">{score}</span>
        <span className="score-label">Correct</span>
      </div>

      <div className="score-divider" />

      <div className="score-item score-wrong">
        <i className="bx bxs-x-circle" />
        <span className="score-num">{wrong}</span>
        <span className="score-label">Wrong</span>
      </div>

      <div className="score-divider" />

      <div className="score-item score-remain">
        <i className="bx bx-card" />
        <span className="score-num">{remaining}</span>
        <span className="score-label">Left</span>
      </div>

      <div className="score-pct-wrap">
        <div className="score-pct-track" role="progressbar" aria-label="Quiz progress" aria-valuemin="0" aria-valuemax={total} aria-valuenow={answered}>
          <div className="score-pct-bar" style={{ width: `${progressPct}%` }} />
        </div>
        <span className="score-pct-label">{answered}/{total} · {accuracyPct}% correct</span>
      </div>

      <style>{`
        .scoreboard {
          display: flex;
          align-items: center;
          gap: 16px;
          background: #fff;
          border: 2px solid var(--ink);
          border-radius: 12px 4px 12px 4px / 4px 12px 4px 12px;
          box-shadow: 3px 3px 0 var(--ink);
          padding: 12px 20px;
          max-width: 720px;
          width: 100%;
          margin: 0 auto;
          flex-wrap: wrap;
          position: relative;
          overflow: hidden;
        }

        .score-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-sketch);
        }

        .score-item i { font-size: 1.2rem; }

        .score-num {
          font-size: 1.4rem;
          font-weight: 700;
          line-height: 1;
        }

        .score-label {
          font-size: 0.9rem;
          color: var(--ink-faded);
        }

        .score-correct i, .score-correct .score-num { color: var(--correct); }
        .score-wrong   i, .score-wrong   .score-num { color: var(--wrong); }
        .score-remain  i, .score-remain  .score-num { color: var(--purple); }

        .score-divider {
          width: 1px;
          height: 32px;
          background: var(--border);
        }

        .score-pct-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-left: auto;
        }

        .score-pct-track {
          width: 120px;
          height: 10px;
          background: var(--paper-cream);
          border: 1.5px solid var(--ink);
          border-radius: 999px;
          overflow: hidden;
        }

        .score-pct-bar {
          height: 100%;
          background: var(--purple);
          border-radius: 999px;
          transition: width 0.5s ease;
        }

        .score-pct-label {
          font-family: var(--font-sketch);
          font-size: 0.95rem;
          color: var(--ink-faded);
          min-width: 112px;
        }

        @media (max-width: 560px) {
          .scoreboard { gap:10px; padding:10px 12px; }
          .score-divider { display:none; }
          .score-pct-wrap { width:100%; margin-left:0; }
          .score-pct-track { flex:1; }
        }
      `}</style>
    </div>
  );
}
