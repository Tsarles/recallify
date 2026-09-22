import { useEffect, useState } from 'react';
import { copySharedDeck, getSharedDeck } from '../utils/decks';

export default function SharedDeck({ deckId, user, onBack, onStudy, onAccount, onToast }) {
  const [deck, setDeck] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getSharedDeck(deckId).then(setDeck).catch(() => setError('This deck is unavailable or no longer shared.'));
  }, [deckId]);

  const saveCopy = async () => {
    if (!user) return onAccount();
    setBusy(true);
    try {
      await copySharedDeck(deck, user.id);
      onToast('A copy was saved to your account.');
    } catch (copyError) {
      onToast(`Error: ${copyError.message}`);
    } finally {
      setBusy(false);
    }
  };

  if (error) return <div className="shared-state sketch-card"><i className="bx bx-link-alt" /><h2>Shared deck not found</h2><p>{error}</p><button className="btn-sketch" onClick={onBack}>Open Recallify</button></div>;
  if (!deck) return <div className="shared-state sketch-card"><i className="bx bx-loader-alt bx-spin" /><p>Opening shared deck…</p></div>;

  return (
    <main className="shared-page">
      <section className="shared-paper sketch-card">
        <p className="shared-kicker"><i className="bx bx-share-alt" /> Shared Recallify deck</p>
        <h1>{deck.title}</h1>
        {deck.subject && <p className="shared-subject"><i className="bx bx-tag" /> {deck.subject}</p>}
        <div className="shared-stats"><span>{deck.cards.length} cards</span><span>{deck.timerSeconds}s per card</span></div>
        {deck.notes && <aside className="shared-notes sticky-note green"><strong><i className="bx bx-note" /> Notes from the deck owner</strong><p>{deck.notes}</p></aside>}
        <div className="shared-preview">
          {deck.cards.slice(0, 3).map((card, index) => <div className="sticky-note yellow" key={index}><strong>{index + 1}.</strong> {card.question}</div>)}
          {deck.cards.length > 3 && <p className="text-faded">And {deck.cards.length - 3} more cards</p>}
        </div>
        <div className="shared-actions">
          <button className="btn-sketch primary" onClick={() => onStudy(deck)}><i className="bx bx-play" /> Study This Deck</button>
          <button className="btn-sketch" onClick={saveCopy} disabled={busy}><i className="bx bx-copy" /> {user ? 'Save a Copy' : 'Sign In to Save'}</button>
          <button className="btn-sketch ghost" onClick={onBack}>Open Recallify</button>
        </div>
      </section>
      <style>{`
        .shared-page { min-height:100svh; display:grid; place-items:center; padding:24px 16px; }
        .shared-paper { width:min(680px,100%); padding:32px; background:#fff; }
        .shared-kicker,.shared-subject,.shared-stats { display:flex; align-items:center; gap:7px; color:var(--ink-faded); }
        .shared-kicker { font-family:var(--font-display); color:var(--purple); font-weight:700; }
        .shared-paper h1 { font-size:clamp(2rem,7vw,3.4rem); margin:8px 0; overflow-wrap:anywhere; }
        .shared-stats { gap:18px; margin:18px 0; font-family:var(--font-display); }
        .shared-preview { display:grid; gap:12px; margin:22px 0; }
        .shared-notes { margin:18px 0; white-space:pre-wrap; overflow-wrap:anywhere; }
        .shared-notes strong { display:flex; align-items:center; gap:7px; margin-bottom:6px; font-family:var(--font-display); }
        .shared-actions { display:flex; flex-wrap:wrap; gap:10px; }
        .shared-state { width:min(520px,calc(100% - 32px)); margin:12vh auto; padding:36px 24px; text-align:center; display:grid; gap:14px; justify-items:center; }
        .shared-state > i { font-size:3rem; color:var(--purple); }
        @media (max-width:480px) { .shared-paper { padding:24px 18px; } .shared-actions .btn-sketch { width:100%; justify-content:center; } }
      `}</style>
    </main>
  );
}
