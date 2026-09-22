import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import QuizCard    from '../components/QuizCard';
import ScoreBoard  from '../components/ScoreBoard';
import RevealButton from '../components/RevealButton';
import { saveQuizResult } from '../utils/decks';

/**
 * Active quiz engine.
 * mode: 'quiz' = full deck   |   'review' = only wrong cards from last run
 * Cards should already be shuffled before being passed in (done in Decklist).
 */
export default function QuizEngine({ deck, userId, mode = 'quiz', onFinish, onBack }) {
  const timerSeconds = deck.timerSeconds || 20;

  const cards = mode === 'review'
    ? deck.cards.filter((c, i) => {
        const last = deck.history?.[deck.history.length - 1];
        return last?.wrongIds?.includes(i);
      })
    : deck.cards;

  const [index,    setIndex]    = useState(0);
  const [score,    setScore]    = useState(0);
  const [wrong,    setWrong]    = useState(0);
  const [wrongIds, setWrongIds] = useState([]);
  const [reveals,  setReveals]  = useState(3);
  const [revealed, setRevealed] = useState(false);
  const [expired,  setExpired]  = useState(false);
  const [timeTaken, setTimeTaken] = useState(null);
  const startTime = useRef(null);
  const resultSaved = useRef(false);
  const toolbarRef = useRef(null);

  useEffect(() => {
    startTime.current = Date.now();
    if (toolbarRef.current) {
      gsap.fromTo(toolbarRef.current,
        { opacity: 0, y: -12 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }
      );
    }
  }, []);

  const done = index >= cards.length;

  useEffect(() => {
    if (!done || resultSaved.current || startTime.current === null) return;
    const elapsed = Math.round((Date.now() - startTime.current) / 1000);
    resultSaved.current = true;
    setTimeTaken(elapsed);
    saveQuizResult(deck, { score, total: cards.length, wrongIds, timeTaken: elapsed }, userId);
  }, [cards.length, deck, done, score, userId, wrongIds]);

  if (cards.length === 0) {
    return (
      <div className="qe-empty">
        <i className="bx bx-check-circle" style={{ fontSize: '3rem', color: 'var(--correct)' }} />
        <h2>No wrong answers to review!</h2>
        <p>You got everything right last time. Try the full deck again.</p>
        <button className="btn-sketch primary" onClick={onBack}>
          <i className="bx bx-arrow-back" /> Back to Decks
        </button>
        <style>{`.qe-empty { display:flex;flex-direction:column;align-items:center;gap:16px;padding:60px 20px;text-align:center; }`}</style>
      </div>
    );
  }

  const current = cards[index];
  const advance = (isCorrect, cardIndex) => {
    setRevealed(false);
    setExpired(false);
    if (isCorrect) {
      setScore((s) => s + 1);
    } else {
      setWrong((w) => w + 1);
      setWrongIds((ids) => [...ids, cardIndex]);
    }
    setIndex((i) => i + 1);
  };

  const handleAnswer = (chosenId) => {
    const isCorrect = chosenId === current.answerId;
    advance(isCorrect, index);
  };

  const handleExpire = () => {
    if (expired) return;
    setExpired(true);
    advance(false, index);
  };

  // ── Finished screen ──────────────────────────────────────
  if (done) {
    const pct      = Math.round((score / cards.length) * 100);
    const icon  = pct === 100 ? 'bxs-trophy' : pct >= 70 ? 'bxs-star' : pct >= 40 ? 'bxs-like' : 'bx-book-open';
    const color = pct === 100 ? 'var(--yellow)' : pct >= 70 ? 'var(--yellow)' : pct >= 40 ? 'var(--blue)' : 'var(--purple)';
    const msg   = pct === 100 ? 'Perfect score!'
                : pct >= 70  ? 'Great job!'
                : pct >= 40  ? 'Keep it up!'
                : 'Keep practising!';

    // Shuffle again for retry
    const handleRetry = () => {
      setIndex(0); setScore(0); setWrong(0);
      setWrongIds([]); setReveals(3); setRevealed(false); setExpired(false);
      startTime.current = Date.now();
      resultSaved.current = false;
      setTimeTaken(null);
      // Note: cards are already shuffled from before, reshuffle for next round
      cards.sort(() => Math.random() - 0.5);
    };

    return (
      <div className="qe-results sketch-card">
        <div className="results-icon-wrap">
          <i className={`bx ${icon} results-icon`} style={{ color }} />
        </div>
        <h2 className="results-title">{msg}</h2>

        <div className="results-stats">
          <div className="result-stat">
            <span className="result-num correct-text">{score}</span>
            <span className="result-label">Correct</span>
          </div>
          <div className="result-stat">
            <span className="result-num wrong-text">{wrong}</span>
            <span className="result-label">Wrong</span>
          </div>
          <div className="result-stat">
            <span className="result-num">{pct}%</span>
            <span className="result-label">Score</span>
          </div>
          <div className="result-stat">
            <span className="result-num">{Math.floor((timeTaken || 0) / 60)}:{String((timeTaken || 0) % 60).padStart(2,'0')}</span>
            <span className="result-label">Time</span>
          </div>
        </div>

        {wrongIds.length > 0 && (
          <div className="results-wrong-list">
            <h3><i className="bx bx-error-circle" /> Missed questions</h3>
            {wrongIds.map((wi) => (
              <div key={wi} className="wrong-item">
                <span className="wrong-num">{wi + 1}</span>
                <span>{cards[wi]?.question}</span>
              </div>
            ))}
          </div>
        )}

        <div className="results-actions">
          <button id="btn-restart" className="btn-sketch primary" onClick={handleRetry}>
            <i className="bx bx-shuffle" /> Shuffle & Retry
          </button>
          {wrongIds.length > 0 && (
            <button id="btn-review-wrong" className="btn-sketch" onClick={() => onFinish('review')}>
              <i className="bx bx-history" /> Review Wrong Only
            </button>
          )}
          <button id="btn-back-results" className="btn-sketch" onClick={onBack}>
            <i className="bx bx-arrow-back" /> Back to Decks
          </button>
        </div>

        <style>{`
          .qe-results {
            max-width: 640px;
            width: 100%;
            margin: 32px auto;
            padding: 36px 28px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 22px;
            text-align: center;
            animation: bounceIn 0.4s ease both;
          }
          .results-icon-wrap { 
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .results-icon {
            font-size: 5rem;
            line-height: 1;
            filter: drop-shadow(2px 3px 0 rgba(0,0,0,0.15));
          }
          .results-title { font-size: 2rem; margin: 0; }
          .results-stats {
            display: flex;
            gap: 24px;
            flex-wrap: wrap;
            justify-content: center;
          }
          .result-stat {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
          }
          .result-num {
            font-family: var(--font-display);
            font-size: 2rem;
            font-weight: 700;
            color: var(--ink);
          }
          .result-label {
            font-family: var(--font-display);
            font-size: 0.9rem;
            color: var(--ink-faded);
          }
          .correct-text { color: var(--correct); }
          .wrong-text   { color: var(--wrong); }
          .results-wrong-list {
            width: 100%;
            text-align: left;
            border-top: 2px dashed var(--border);
            padding-top: 16px;
          }
          .results-wrong-list h3 {
            font-size: 1.1rem;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--wrong);
          }
          .wrong-item {
            display: flex;
            gap: 10px;
            align-items: flex-start;
            padding: 8px 10px;
            border-radius: 6px;
            font-size: 0.92rem;
            background: var(--wrong-bg);
            margin-bottom: 6px;
          }
          .wrong-num {
            font-family: var(--font-display);
            font-weight: 700;
            min-width: 24px;
            color: var(--wrong);
          }
          .results-actions {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            justify-content: center;
          }
          @media (max-width: 480px) {
            .qe-results { padding: 24px 16px; margin: 20px auto; }
            .results-title { font-size: 1.5rem; }
            .result-num { font-size: 1.5rem; }
          }
        `}</style>
      </div>
    );
  }

  // ── Active quiz card ──────────────────────────────────────
  return (
    <div className="qe-active">
      <div ref={toolbarRef} className="qe-toolbar">
        <button id="btn-quit-quiz" className="btn-sketch" onClick={onBack} style={{ fontSize: '0.9rem', padding: '7px 14px' }}>
          <i className="bx bx-arrow-back" /> Quit
        </button>
        <p className="qe-deck-name">
          <i className="bx bx-collection" /> {deck.title}
          {mode === 'review' && <span className="review-badge"> (Review Mode)</span>}
        </p>
      </div>

      <ScoreBoard score={score} wrong={wrong} total={cards.length} />

      {expired && (
        <div className="expired-banner">
          <i className="bx bx-time-five" /> Time's up! Moving on…
        </div>
      )}

      <QuizCard
        key={index}
        data={current}
        cardIndex={index}
        totalCards={cards.length}
        onAnswer={handleAnswer}
        onExpire={handleExpire}
        revealed={revealed}
        timerSeconds={timerSeconds}
        showAnswerLabels={Boolean(deck.showAnswerLabels)}
      />

      <div className="qe-bottom">
        <RevealButton
          answer={current.type === 'multiple-choice' ? (current.options.find((option) => option.id === current.answerId)?.text || current.answerId) : current.answerId}
          reveals={reveals}
          setReveals={setReveals}
          revealed={revealed}
          setRevealed={setRevealed}
        />
      </div>

      <style>{`
        .qe-active {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 18px;
          padding: 24px 20px 60px;
          width: 100%;
          max-width: 760px;
          margin: 0 auto;
        }

        .qe-toolbar {
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
          flex-wrap: wrap;
        }

        .qe-deck-name {
          font-family: var(--font-display);
          font-size: 1rem;
          color: var(--ink-faded);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .review-badge {
          color: var(--purple);
          font-size: 0.85rem;
        }

        .expired-banner {
          width: 100%;
          max-width: 720px;
          text-align: center;
          background: var(--wrong-bg);
          border: 2px solid var(--wrong);
          border-radius: 8px;
          padding: 10px;
          font-family: var(--font-display);
          font-size: 1rem;
          color: var(--wrong);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          animation: bounceIn 0.3s ease;
        }

        .qe-bottom {
          width: 100%;
          max-width: 720px;
        }

        @media (max-width: 480px) {
          .qe-active { padding: 16px 14px 48px; gap: 14px; }
        }
      `}</style>
    </div>
  );
}
