import { useState, useRef } from 'react';
import gsap from 'gsap';
import Timer from './Timer';
import { shuffleCopy } from '../utils/shuffle';

const OPTION_COLORS = ['var(--blue-bg)', 'var(--yellow-bg)', 'var(--green-bg)', 'var(--pink-bg)'];
const OPTION_BORDERS = ['var(--blue)', 'var(--yellow)', 'var(--green)', 'var(--pink)'];

export default function QuizCard({
  data,
  cardIndex,
  totalCards,
  onAnswer,
  onExpire,
  revealed,
  timerSeconds = 20,
  showAnswerLabels = false,
}) {
  const [chosen, setChosen] = useState(null);
  const [locked, setLocked] = useState(false);
  const [options] = useState(() => shuffleCopy(data.options || []));
  const cardRef = useRef(null);

  const handleChoose = (optId) => {
    if (locked) return;
    setChosen(optId);
    setLocked(true);
    const isCorrect = optId === data.answerId;
    // Feedback animation
    gsap.to(cardRef.current, {
      x: isCorrect ? [0, 6, -4, 0] : [0, -8, 6, -4, 0],
      duration: isCorrect ? 0.35 : 0.4,
      ease: 'power2.inOut',
    });
    setTimeout(() => onAnswer(optId), 900);
  };

  const getOptionState = (optId) => {
    if (!locked && !revealed) return 'default';
    if (optId === data.answerId) return 'correct';
    if (optId === chosen && optId !== data.answerId) return 'wrong';
    return 'default';
  };

  // Identification card
  if (data.type === 'identification') {
    return (
      <div ref={cardRef} className="quiz-card sketch-card ident-card" style={{ animation: 'bounceIn 0.35s ease both' }}>
        <div className="card-meta">
          <span className="card-counter">{cardIndex + 1} / {totalCards}</span>
          <span className="card-type-badge">
            <i className="bx bx-pencil" /> Identification
          </span>
        </div>

        <Timer key={cardIndex} seconds={timerSeconds} onExpire={onExpire} running={!locked} />

        <div className="ident-question">
          <p className="question-text">{data.question}</p>
        </div>
        {(locked || revealed) && (
          <div className="ident-answer">
            <i className="bx bx-check-circle" /> {data.answerId}
          </div>
        )}
        {!locked && (
          <button id="btn-ident-know" className="btn-sketch success" onClick={() => handleChoose(data.answerId)}>
            <i className="bx bx-check" /> I know this!
          </button>
        )}
        <CardStyles />
      </div>
    );
  }

  // Multiple-choice card
  return (
    <div ref={cardRef} className="quiz-card sketch-card" style={{ animation: 'bounceIn 0.35s ease both' }}>
      <div className="card-meta">
        <span className="card-counter">{cardIndex + 1} / {totalCards}</span>
        <span className="card-type-badge">
          <i className="bx bx-list-check" /> Multiple Choice
        </span>
      </div>

      <Timer key={cardIndex} seconds={timerSeconds} onExpire={onExpire} running={!locked} />

      <p className="question-text">{data.question}</p>

      <div className="options-grid">
        {options.map((opt, optionIndex) => {
          const state = getOptionState(opt.id);
          return (
            <button
              key={opt.id}
              id={`btn-option-${opt.id}`}
              className={`option-btn option-btn--${state}`}
              style={{
                '--opt-bg':     OPTION_COLORS[optionIndex] || 'var(--paper)',
                '--opt-border': OPTION_BORDERS[optionIndex] || 'var(--border)',
              }}
              onClick={() => handleChoose(opt.id)}
              disabled={locked}
            >
              {showAnswerLabels && <span className="opt-label">{String.fromCharCode(65 + optionIndex)}.</span>}
              <span className="opt-text">{opt.text}</span>
              {state === 'correct' && <i className="bx bxs-check-circle opt-icon" />}
              {state === 'wrong'   && <i className="bx bxs-x-circle opt-icon" />}
            </button>
          );
        })}
      </div>

      <CardStyles />
    </div>
  );
}

function CardStyles() {
  return (
    <style>{`
      .quiz-card {
        padding: 28px 32px;
        max-width: 720px;
        width: 100%;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .card-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .card-counter {
        font-family: var(--font-display);
        font-size: 1rem;
        color: var(--ink-faded);
        font-weight: 600;
      }

      .card-type-badge {
        font-family: var(--font-display);
        font-size: 0.88rem;
        background: var(--purple-bg);
        color: var(--purple);
        border: 1.5px solid var(--purple);
        border-radius: 99px;
        padding: 3px 12px;
        display: flex;
        align-items: center;
        gap: 5px;
        font-weight: 600;
      }

      .question-text {
        font-family: var(--font-display);
        font-size: clamp(1.1rem, 3vw, 1.45rem);
        font-weight: 700;
        color: var(--ink);
        line-height: 1.4;
      }

      /* Options */
      .options-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }

      @media (max-width: 560px) {
        .options-grid { grid-template-columns: 1fr; }
        .quiz-card { padding: 20px 16px; }
      }

      .option-btn {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        border: 2.5px solid var(--ink);
        border-radius: 10px 4px 10px 4px / 4px 10px 4px 10px;
        background: var(--opt-bg);
        cursor: pointer;
        text-align: left;
        transition: transform 0.08s, box-shadow 0.08s;
        box-shadow: 3px 3px 0 var(--ink);
        font-family: var(--font-body);
        font-size: 0.97rem;
        color: var(--ink);
        position: relative;
      }

      .option-btn:not(:disabled):hover {
        transform: translate(-1px, -1px);
        box-shadow: 4px 4px 0 var(--opt-border, var(--ink));
        border-color: var(--opt-border, var(--ink));
      }

      .option-btn:disabled { cursor: default; }

      .option-btn--correct {
        border-color: var(--correct) !important;
        background: var(--correct-bg) !important;
        box-shadow: 3px 3px 0 var(--correct) !important;
      }

      .option-btn--wrong {
        border-color: var(--wrong) !important;
        background: var(--wrong-bg) !important;
        box-shadow: 3px 3px 0 var(--wrong) !important;
        opacity: 0.85;
      }

      .opt-text { flex: 1; line-height: 1.4; }
      .opt-label { align-self:flex-start; font-family:var(--font-display); font-weight:700; min-width:20px; }

      .opt-icon {
        font-size: 1.2rem;
        flex-shrink: 0;
      }

      .option-btn--correct .opt-icon { color: var(--correct); }
      .option-btn--wrong   .opt-icon { color: var(--wrong); }

      /* Identification card */
      .ident-card { text-align: center; align-items: center; }
      .ident-question { width: 100%; }
      .ident-answer {
        font-family: var(--font-display);
        font-size: 1.3rem;
        font-weight: 700;
        color: var(--correct);
        background: var(--correct-bg);
        border: 2px solid var(--correct);
        border-radius: 8px;
        padding: 10px 20px;
        display: flex;
        align-items: center;
        gap: 8px;
        animation: bounceIn 0.3s ease;
      }
    `}</style>
  );
}
