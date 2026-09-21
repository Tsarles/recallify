import { archiveDeck, getShareUrl, listDecks, removeDeck, updateDeck } from '../utils/decks';
import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';

const DECK_COLORS = [
  { bg: 'var(--yellow-bg)', border: 'var(--yellow)', icon: 'bxs-book' },
  { bg: 'var(--blue-bg)',   border: 'var(--blue)',   icon: 'bxs-book-alt' },
  { bg: 'var(--green-bg)',  border: 'var(--green)',  icon: 'bxs-bookmarks' },
  { bg: 'var(--pink-bg)',   border: 'var(--pink)',   icon: 'bxs-book-bookmark' },
  { bg: 'var(--purple-bg)', border: 'var(--purple)', icon: 'bxs-bookmark-star' },
];

const TIMER_PRESETS = [
  { label: '10s', value: 10 },
  { label: '15s', value: 15 },
  { label: '20s', value: 20 },
  { label: '30s', value: 30 },
  { label: '45s', value: 45 },
  { label: '60s', value: 60 },
];

// ── Settings Modal ────────────────────────────────────────────
function SettingsModal({ deck, onClose, onSave }) {
  const [timer, setTimer] = useState(deck.timerSeconds || 20);
  const [custom, setCustom] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const overlayRef = useRef(null);
  const cardRef    = useRef(null);

  useEffect(() => {
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.22 });
    gsap.fromTo(cardRef.current,
      { opacity: 0, scale: 0.85, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'back.out(1.5)' }
    );
  }, []);

  const handleSave = () => {
    const val = useCustom ? parseInt(custom, 10) : timer;
    if (!val || val < 5 || val > 300) return;
    onSave({ timerSeconds: val });
    handleClose();
  };

  const handleClose = () => {
    gsap.to(cardRef.current, { opacity: 0, scale: 0.88, y: 12, duration: 0.18, ease: 'power2.in' });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.2, onComplete: onClose });
  };

  return (
    <div ref={overlayRef} className="modal-overlay" onClick={e => e.target === overlayRef.current && handleClose()}>
      <div ref={cardRef} className="settings-modal sketch-card">
        <button className="modal-close-btn" onClick={handleClose}><i className="bx bx-x" /></button>
        <div className="settings-pin">⚙️</div>
        <h3 className="settings-title">Deck Settings</h3>
        <p className="settings-deck-name">{deck.title}</p>

        <div className="settings-section">
          <label className="settings-label">
            <i className="bx bx-time" /> Timer per card
          </label>
          <div className="timer-presets">
            {TIMER_PRESETS.map(p => (
              <button
                key={p.value}
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
              id="custom-timer-check"
              checked={useCustom}
              onChange={e => setUseCustom(e.target.checked)}
            />
            <label htmlFor="custom-timer-check" className="custom-timer-label">Custom (5–300s):</label>
            <input
              type="number"
              className="sketch-input custom-timer-input"
              min={5} max={300}
              placeholder="e.g. 25"
              value={custom}
              disabled={!useCustom}
              onChange={e => setCustom(e.target.value)}
            />
          </div>
        </div>

        <div className="settings-actions">
          <button className="btn-sketch primary" onClick={handleSave}>
            <i className="bx bxs-save" /> Save Settings
          </button>
          <button className="btn-sketch" onClick={handleClose}>Cancel</button>
        </div>
      </div>

      <style>{`
        .settings-modal {
          width: min(420px, 92vw);
          padding: 40px 28px 28px;
          position: relative;
          animation: bounceIn 0.35s ease;
          background: var(--yellow-bg);
        }
        .settings-pin {
          position: absolute;
          top: -14px; left: 50%;
          transform: translateX(-50%);
          font-size: 1.5rem;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
        }
        .modal-close-btn {
          position: absolute;
          top: 10px; right: 10px;
          background: rgba(0,0,0,0.08);
          border: none; border-radius: 50%;
          width: 30px; height: 30px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 1.1rem; color: var(--ink);
        }
        .modal-close-btn:hover { background: rgba(0,0,0,0.16); }
        .settings-title {
          font-size: 1.4rem;
          margin-bottom: 4px;
        }
        .settings-deck-name {
          font-size: 0.9rem;
          color: var(--ink-faded);
          margin-bottom: 20px;
        }
        .settings-section { margin-bottom: 20px; }
        .settings-label {
          font-family: var(--font-display);
          font-size: 1rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 12px;
          color: var(--ink);
        }
        .timer-presets {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
        }
        .timer-preset-btn {
          font-family: var(--font-display);
          font-size: 0.9rem;
          font-weight: 600;
          padding: 6px 14px;
          border: 2px solid var(--ink);
          border-radius: 99px;
          background: #fff;
          cursor: pointer;
          box-shadow: 2px 2px 0 var(--ink);
          transition: background 0.12s, transform 0.08s;
        }
        .timer-preset-btn:hover { transform: translate(-1px,-1px); box-shadow: 3px 3px 0 var(--ink); }
        .timer-preset-btn.active { background: var(--yellow); font-weight: 700; }
        .custom-timer-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .custom-timer-label {
          font-family: var(--font-display);
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
        }
        .custom-timer-input {
          width: 90px !important;
          padding: 7px 10px;
          font-size: 0.9rem;
        }
        .settings-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
}

// ── Edit Modal ────────────────────────────────────────────────
function EditModal({ deck, onClose, onSave }) {
  const [title,   setTitle]   = useState(deck.title);
  const [subject, setSubject] = useState(deck.subject || '');
  const overlayRef = useRef(null);
  const cardRef    = useRef(null);

  useEffect(() => {
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.22 });
    gsap.fromTo(cardRef.current,
      { opacity: 0, scale: 0.85, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'back.out(1.5)' }
    );
  }, []);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ title: title.trim(), subject: subject.trim() });
    handleClose();
  };

  const handleClose = () => {
    gsap.to(cardRef.current, { opacity: 0, scale: 0.88, y: 12, duration: 0.18, ease: 'power2.in' });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.2, onComplete: onClose });
  };

  return (
    <div ref={overlayRef} className="modal-overlay" onClick={e => e.target === overlayRef.current && handleClose()}>
      <div ref={cardRef} className="edit-modal sketch-card">
        <button className="modal-close-btn" onClick={handleClose}><i className="bx bx-x" /></button>
        <div className="settings-pin">✏️</div>
        <h3 className="settings-title">Edit Deck</h3>

        <div className="edit-form">
          <div className="form-group-row">
            <label className="settings-label">Deck Title</label>
            <input
              className="sketch-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Deck title"
            />
          </div>
          <div className="form-group-row">
            <label className="settings-label">Subject / Tag</label>
            <input
              className="sketch-input"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="e.g. Chemistry, History…"
            />
          </div>
        </div>

        <div className="settings-actions" style={{ marginTop: 20 }}>
          <button className="btn-sketch primary" onClick={handleSave} disabled={!title.trim()}>
            <i className="bx bxs-save" /> Save Changes
          </button>
          <button className="btn-sketch" onClick={handleClose}>Cancel</button>
        </div>
      </div>

      <style>{`
        .edit-modal {
          width: min(400px, 92vw);
          padding: 40px 28px 28px;
          position: relative;
          background: var(--green-bg);
        }
        .edit-form { display: flex; flex-direction: column; gap: 14px; }
        .form-group-row { display: flex; flex-direction: column; gap: 6px; }
      `}</style>
    </div>
  );
}

// ── Main Decklist ─────────────────────────────────────────────
export default function Decklist({ onSelectDeck, onAddDeck, onShowToast, userId, refreshKey }) {
  const [decks,       setDecks]      = useState([]);
  const [confirmDel,  setConfirm]    = useState(null);
  const [settingsDeck, setSettingsDeck] = useState(null);
  const [editDeck,    setEditDeck]   = useState(null);
  const gridRef = useRef(null);

  const refresh = async () => {
    try {
      setDecks(await listDecks(userId));
    } catch (error) {
      onShowToast?.(`Error: ${error.message}`);
    }
  };

  useEffect(() => {
    let active = true;
    listDecks(userId)
      .then((nextDecks) => active && setDecks(nextDecks))
      .catch((error) => active && onShowToast?.(`Error: ${error.message}`));
    return () => { active = false; };
  }, [onShowToast, userId, refreshKey]);

  useEffect(() => {
    if (gridRef.current) {
      const cards = gridRef.current.querySelectorAll('.deck-card');
      gsap.fromTo(cards,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, stagger: 0.07, duration: 0.4, ease: 'power3.out' }
      );
    }
  }, []);

  const handleDelete = async (id) => {
    try {
      await removeDeck(id, userId);
      await refresh();
      setConfirm(null);
    } catch (error) {
      onShowToast?.(`Error: ${error.message}`);
    }
  };

  const handleArchive = async (id, title) => {
    try {
      await archiveDeck(id, userId);
      await refresh();
      onShowToast?.(`"${title}" archived — deletes in 30 days.`);
    } catch (error) {
      onShowToast?.(`Error: ${error.message}`);
    }
  };

  const handleSaveSettings = async (deckId, updates) => {
    await updateDeck(deckId, updates, userId);
    await refresh();
    onShowToast?.('Settings saved!');
    setSettingsDeck(null);
  };

  const handleSaveEdit = async (deckId, updates) => {
    await updateDeck(deckId, updates, userId);
    await refresh();
    onShowToast?.('Deck updated!');
    setEditDeck(null);
  };

  // Shuffle cards before starting quiz
  const handlePlay = (deck) => {
    const shuffled = { ...deck, cards: [...deck.cards].sort(() => Math.random() - 0.5) };
    onSelectDeck(shuffled, 'quiz');
  };

  const handleShare = async (deck) => {
    if (!userId) return onShowToast?.('Error: Sign in to create a shareable cloud link.');
    try {
      const shared = await updateDeck(deck.id, { isPublic: !deck.isPublic }, userId);
      await refresh();
      if (shared.isPublic) {
        await navigator.clipboard.writeText(getShareUrl(deck.id));
        onShowToast?.('Share link copied. Anyone with it can study this deck.');
      } else {
        onShowToast?.('Sharing turned off for this deck.');
      }
    } catch (error) {
      onShowToast?.(`Error: ${error.message}`);
    }
  };

  const slotsLeft = 5 - decks.length;

  return (
    <div className="decklist-page inner-page-wrap">
      <div className="decklist-header">
        <div>
          <h2 className="decklist-title">
            <i className="bx bx-collection" /> My Decks
          </h2>
          <p className="decklist-sub">
            {decks.length} / 5 decks used
          </p>
        </div>
        {decks.length < 5 && (
          <button id="btn-add-deck" className="btn-sketch primary" onClick={onAddDeck}>
            <i className="bx bx-plus" /> New Deck
          </button>
        )}
      </div>

      {decks.length === 0 ? (
        <div className="decklist-empty sketch-card">
          <i className="bx bx-book-open empty-icon" />
          <h3>No decks yet!</h3>
          <p>Create your first deck by pasting quiz questions from AI.</p>
          <button id="btn-create-first" className="btn-sketch primary" onClick={onAddDeck}>
            <i className="bx bx-plus" /> Create First Deck
          </button>
        </div>
      ) : (
        <div ref={gridRef} className="deck-grid">
          {decks.map((deck, i) => {
            const color = DECK_COLORS[i % DECK_COLORS.length];
            const lastRun = deck.history?.[deck.history.length - 1];
            return (
              <div
                key={deck.id}
                className="deck-card sketch-card"
                style={{ '--deck-bg': color.bg, '--deck-border': color.border }}
              >
                {/* Delete confirm overlay */}
                {confirmDel === deck.id && (
                  <div className="delete-overlay">
                    <p>Delete <strong>{deck.title}</strong>?</p>
                    <div className="delete-actions">
                      <button className="btn-sketch danger" onClick={() => handleDelete(deck.id)}>
                        <i className="bx bx-trash" /> Yes, delete
                      </button>
                      <button className="btn-sketch" onClick={() => setConfirm(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="deck-card-top">
                  <div className="deck-icon-wrap">
                    <i className={`bx ${color.icon} deck-icon`} />
                  </div>
                  {/* Action row */}
                  <div className="deck-top-actions">
                    <button className="deck-icon-btn" onClick={() => handleShare(deck)} title={deck.isPublic ? 'Stop sharing' : 'Share deck'}>
                      <i className={`bx ${deck.isPublic ? 'bxs-share-alt' : 'bx-share-alt'}`} />
                    </button>
                    <button
                      id={`btn-settings-${deck.id}`}
                      className="deck-icon-btn"
                      onClick={() => setSettingsDeck(deck)}
                      title="Settings"
                    >
                      <i className="bx bx-cog" />
                    </button>
                    <button
                      id={`btn-edit-${deck.id}`}
                      className="deck-icon-btn"
                      onClick={() => setEditDeck(deck)}
                      title="Edit deck"
                    >
                      <i className="bx bx-pencil" />
                    </button>
                    <button
                      id={`btn-archive-${deck.id}`}
                      className="deck-icon-btn"
                      onClick={() => handleArchive(deck.id, deck.title)}
                      title="Archive deck"
                    >
                      <i className="bx bx-archive" />
                    </button>
                    <button
                      id={`btn-delete-${deck.id}`}
                      className="deck-icon-btn deck-icon-btn--danger"
                      onClick={() => setConfirm(deck.id)}
                      title="Delete deck"
                    >
                      <i className="bx bx-trash" />
                    </button>
                  </div>
                </div>

                <div className="deck-info">
                  <h3 className="deck-name">{deck.title}</h3>
                  {deck.subject && (
                    <span className="deck-subject">
                      <i className="bx bx-tag" /> {deck.subject}
                    </span>
                  )}
                  <p className="deck-card-count">
                    <i className="bx bx-card" /> {deck.cards.length} cards
                  </p>
                  <p className="deck-timer-info">
                    <i className="bx bx-time" /> {deck.timerSeconds || 20}s per card
                  </p>
                  {lastRun && (
                    <p className="deck-last-score">
                      Last: {lastRun.score}/{lastRun.total} (
                      {Math.round((lastRun.score / lastRun.total) * 100)}%)
                    </p>
                  )}
                </div>

                <div className="deck-actions">
                  <button
                    id={`btn-play-${deck.id}`}
                    className="btn-sketch primary"
                    onClick={() => handlePlay(deck)}
                  >
                    <i className="bx bx-shuffle" /> Shuffle & Play
                  </button>
                  {lastRun?.wrongIds?.length > 0 && (
                    <button
                      id={`btn-review-${deck.id}`}
                      className="btn-sketch"
                      onClick={() => onSelectDeck(deck, 'review')}
                    >
                      <i className="bx bx-history" /> Review Wrong
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Empty slots */}
          {Array.from({ length: slotsLeft }).map((_, i) => (
            <button key={`empty-${i}`} type="button" className="deck-card deck-card--empty" onClick={onAddDeck}>
              <i className="bx bx-plus-circle empty-slot-icon" />
              <span>Add Deck</span>
            </button>
          ))}
        </div>
      )}

      {/* Settings Modal */}
      {settingsDeck && (
        <SettingsModal
          deck={settingsDeck}
          onClose={() => setSettingsDeck(null)}
          onSave={(updates) => handleSaveSettings(settingsDeck.id, updates)}
        />
      )}

      {/* Edit Modal */}
      {editDeck && (
        <EditModal
          deck={editDeck}
          onClose={() => setEditDeck(null)}
          onSave={(updates) => handleSaveEdit(editDeck.id, updates)}
        />
      )}

      <style>{`
        .decklist-page {
          max-width: 900px;
          margin: 0 auto;
          padding: 32px 20px 60px;
          width: 100%;
        }

        .decklist-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }

        .decklist-title {
          font-size: 2rem;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 4px;
        }

        .decklist-sub {
          color: var(--ink-faded);
          font-size: 0.95rem;
        }

        /* Grid */
        .deck-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 20px;
        }

        /* Deck card */
        .deck-card {
          padding: 20px;
          background: var(--deck-bg, #fff);
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: relative;
          overflow: hidden;
          transition: transform 0.12s;
        }
        .deck-card:hover { transform: translateY(-3px); }

        .deck-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .deck-icon-wrap {
          width: 44px; height: 44px;
          border-radius: 10px;
          background: rgba(255,255,255,0.7);
          border: 2px solid var(--deck-border, var(--border));
          display: flex; align-items: center; justify-content: center;
        }
        .deck-icon { font-size: 1.5rem; color: var(--ink); }

        .deck-top-actions {
          display: flex;
          gap: 2px;
        }
        .deck-icon-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--ink-faded);
          font-size: 1.05rem;
          padding: 5px 6px;
          border-radius: 6px;
          transition: color 0.15s, background 0.15s;
        }
        .deck-icon-btn:hover { color: var(--ink); background: rgba(0,0,0,0.06); }
        .deck-icon-btn--danger:hover { color: var(--wrong); background: var(--wrong-bg); }

        .deck-info { flex: 1; }
        .deck-name {
          font-size: 1.15rem;
          margin-bottom: 4px;
        }
        .deck-subject, .deck-card-count, .deck-timer-info {
          font-size: 0.85rem;
          color: var(--ink-faded);
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 3px;
        }
        .deck-last-score {
          font-size: 0.85rem;
          color: var(--correct);
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 3px;
          font-weight: 600;
        }

        .deck-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .deck-actions .btn-sketch {
          flex: 1;
          font-size: 0.9rem;
          padding: 8px 10px;
          justify-content: center;
        }

        /* Empty slot */
        .deck-card--empty {
          border: 2.5px dashed var(--border);
          box-shadow: none;
          background: transparent;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          min-height: 160px;
          gap: 10px;
          color: var(--ink-faded);
          font-family: var(--font-display);
          font-size: 1rem;
          transition: border-color 0.2s, color 0.2s;
        }
        .deck-card--empty:hover { border-color: var(--purple); color: var(--purple); }
        .empty-slot-icon { font-size: 2rem; }

        /* Empty state */
        .decklist-empty {
          padding: 48px 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          text-align: center;
        }
        .empty-icon { font-size: 4rem; color: var(--border); }

        /* Delete overlay */
        .delete-overlay {
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.95);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          z-index: 10;
          padding: 20px;
          text-align: center;
          font-size: 1rem;
          border-radius: inherit;
          animation: fadeIn 0.18s ease;
        }
        .delete-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: center;
        }

        @media (max-width: 480px) {
          .decklist-page { padding: 24px 14px 48px; }
          .deck-grid { grid-template-columns: 1fr; }
          .decklist-title { font-size: 1.6rem; }
        }
      `}</style>
    </div>
  );
}
