import { useState, useEffect, useRef } from 'react';

/**
 * Timer component — countdown bar + seconds display.
 * Calls onExpire when time runs out.
 */
export default function Timer({ seconds = 20, onExpire, running = true }) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const onExpireRef = useRef(onExpire);
  const pct = Math.max(0, (timeLeft / seconds) * 100);

  // colour shifts: green → yellow → red
  const barColor =
    pct > 60 ? 'var(--correct)' :
    pct > 30 ? 'var(--yellow)'  :
               'var(--wrong)';

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    setTimeLeft(seconds);
  }, [seconds]);

  useEffect(() => {
    if (!running) return;
    if (timeLeft <= 0) {
      onExpireRef.current?.();
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, running]);

  return (
    <div className="timer-wrap">
      <div className="timer-label">
        <i className="bx bx-time-five" />
        <span className="timer-seconds" style={{ color: barColor }}>
          {timeLeft}s
        </span>
      </div>
      <div className="timer-track">
        <div
          className="timer-bar"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>

      <style>{`
        .timer-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
        }
        .timer-label {
          display: flex;
          align-items: center;
          gap: 4px;
          font-family: var(--font-display);
          font-size: 1.1rem;
          font-weight: 700;
          min-width: 50px;
          color: var(--ink-light);
        }
        .timer-seconds {
          transition: color 0.4s;
          font-variant-numeric: tabular-nums;
        }
        .timer-track {
          flex: 1;
          height: 10px;
          background: var(--paper-cream);
          border: 2px solid var(--ink);
          border-radius: 999px;
          overflow: hidden;
        }
        .timer-bar {
          height: 100%;
          border-radius: 999px;
          transition: width 0.9s linear, background 0.4s;
        }
      `}</style>
    </div>
  );
}
