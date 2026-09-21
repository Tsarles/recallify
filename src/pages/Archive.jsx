import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { daysUntilExpiry } from '../utils/storage';
import { listDecks, removeDeck, restoreDeck } from '../utils/decks';

export default function Archive({ onShowToast, userId, refreshKey }) {
  const [decks, setDecks] = useState([]);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      const cards = listRef.current.querySelectorAll('.arch-card');
      gsap.fromTo(cards,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, stagger: 0.08, duration: 0.45, ease: 'power3.out' }
      );
    }
  }, []);

  const refresh = async () => {
    try {
      setDecks(await listDecks(userId, true));
    } catch (error) {
      onShowToast?.(`Error: ${error.message}`);
    }
  };

  useEffect(() => {
    let active = true;
    listDecks(userId, true)
      .then((nextDecks) => active && setDecks(nextDecks))
      .catch((error) => active && onShowToast?.(`Error: ${error.message}`));
    return () => { active = false; };
  }, [onShowToast, userId, refreshKey]);

  const handleRestore = async (id, title) => {
    try {
      const activeCount = (await listDecks(userId)).length;
      if (activeCount >= 5) throw new Error("Can't restore — you already have 5 active decks!");
      await restoreDeck(id, userId);
      await refresh();
      onShowToast?.(`"${title}" restored to decks!`);
    } catch (e) {
      onShowToast?.(`Error: ${e.message}`);
    }
  };

  const handleDelete = async (id, title) => {
    try {
      await removeDeck(id, userId);
      await refresh();
      onShowToast?.(`"${title}" permanently deleted.`);
    } catch (error) {
      onShowToast?.(`Error: ${error.message}`);
    }
  };

  return (
    <div className="archive-page inner-page-wrap">
      <div className="archive-header">
        <div>
          <h2 className="archive-title">
            <i className="bx bx-archive" /> Archive
          </h2>
          <p className="archive-sub">Archived decks are permanently deleted after 30 days.</p>
        </div>
      </div>

      {decks.length === 0 ? (
        <div className="archive-empty sketch-card">
          <i className="bx bx-archive empty-icon" />
          <h3>Archive is empty</h3>
          <p>Archived decks will appear here. They auto-delete after 30 days.</p>
        </div>
      ) : (
        <div ref={listRef} className="arch-grid">
          {decks.map((deck) => {
            const days = daysUntilExpiry(deck.archivedAt);
            const urgent = days <= 5;
            return (
              <div key={deck.id} className="arch-card sketch-card">
                <div className="arch-card-top">
                  <div className="arch-info">
                    <h3 className="arch-name">{deck.title}</h3>
                    {deck.subject && (
                      <span className="arch-subject">
                        <i className="bx bx-tag" /> {deck.subject}
                      </span>
                    )}
                    <p className="arch-count">
                      <i className="bx bx-card" /> {deck.cards.length} cards
                    </p>
                  </div>
                  <div className={`arch-expiry ${urgent ? 'urgent' : ''}`}>
                    <i className={`bx ${urgent ? 'bxs-time' : 'bx-time'}`} />
                    {days}d left
                  </div>
                </div>

                <div className="arch-actions">
                  <button
                    id={`btn-restore-${deck.id}`}
                    className="btn-sketch success"
                    onClick={() => handleRestore(deck.id, deck.title)}
                  >
                    <i className="bx bx-revision" /> Restore
                  </button>
                  <button
                    id={`btn-perma-delete-${deck.id}`}
                    className="btn-sketch danger"
                    onClick={() => handleDelete(deck.id, deck.title)}
                  >
                    <i className="bx bx-trash" /> Delete Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .archive-page {
          max-width: 860px;
          margin: 0 auto;
          padding: 32px 20px 60px;
          width: 100%;
        }
        .archive-header {
          margin-bottom: 28px;
        }
        .archive-title {
          font-size: 2rem;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 4px;
        }
        .archive-sub {
          color: var(--ink-faded);
          font-size: 0.95rem;
        }
        .arch-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 18px;
        }
        .arch-card {
          padding: 20px;
          background: var(--paper-cream);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .arch-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
        }
        .arch-info { flex: 1; }
        .arch-name {
          font-size: 1.1rem;
          margin-bottom: 4px;
        }
        .arch-subject, .arch-count {
          font-size: 0.85rem;
          color: var(--ink-faded);
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 3px;
        }
        .arch-expiry {
          font-family: var(--font-display);
          font-size: 0.85rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 99px;
          background: var(--paper-dark);
          color: var(--ink-faded);
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .arch-expiry.urgent {
          background: var(--wrong-bg);
          color: var(--wrong);
        }
        .arch-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .arch-actions .btn-sketch {
          flex: 1;
          font-size: 0.9rem;
          padding: 8px 12px;
          justify-content: center;
        }
        .archive-empty {
          padding: 48px 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          text-align: center;
        }
        .empty-icon { font-size: 4rem; color: var(--border); }

        @media (max-width: 480px) {
          .archive-page { padding: 24px 14px 48px; }
          .arch-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
