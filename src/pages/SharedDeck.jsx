import { useEffect, useState } from 'react';
import { copySharedDeck, getSharedDeck } from '../utils/decks';
import { getPublicProfile } from '../utils/profiles';
import ProfileAvatar from '../components/ProfileAvatar';

export default function SharedDeck({ deckId, user, onBack, onStudy, onAccount, onToast }) {
  const [deck, setDeck] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [owner, setOwner] = useState(null);

  useEffect(() => {
    let active = true;
    getSharedDeck(deckId)
      .then(async (nextDeck) => {
        const nextOwner = await getPublicProfile(nextDeck.ownerId);
        if (active) { setDeck(nextDeck); setOwner(nextOwner); }
      })
      .catch(() => active && setError('This deck is unavailable or no longer shared.'));
    return () => { active = false; };
  }, [deckId]);

  const saveCopy = async () => {
    if (!user) return onAccount();
    setBusy(true);
    try {
      await copySharedDeck(deck, user.id, owner);
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
        <div className="shared-ribbon"><i className="bx bx-gift" /> Shared with you</div>
        <header className="shared-cover">
          <p className="shared-kicker"><i className="bx bx-share-alt" /> Recallify community deck</p>
          <h1>{deck.title}</h1>
          {deck.subject && <p className="shared-subject"><i className="bx bx-tag" /> {deck.subject}</p>}
          <div className="shared-owner">
            <ProfileAvatar avatarKey={owner?.avatar_key} size="small" />
            <span><small>Shared by</small><strong>{owner?.display_name || 'A Recallify learner'}</strong>{owner?.username && <em>@{owner.username}</em>}</span>
          </div>
        </header>
        <div className="shared-stats"><span><i className="bx bx-card" /> {deck.cards.length} cards</span><span><i className="bx bx-time" /> {deck.timerSeconds}s per card</span><span><i className="bx bx-shuffle" /> Shuffled quiz</span></div>
        {deck.notes && <aside className="shared-notes sticky-note green"><strong><i className="bx bx-note" /> Notes from the deck owner</strong><p>{deck.notes}</p></aside>}
        <div className="shared-preview">
          <h2>Preview the deck</h2>
          {deck.cards.slice(0, 3).map((card, index) => <div className="shared-preview-row" key={index}><span>{index + 1}</span><p>{card.question}</p></div>)}
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
        .shared-paper { width:min(720px,100%); padding:0; background:#fff; overflow:hidden; border-color:#173f35; box-shadow:7px 7px 0 #173f35; }
        .shared-cover { padding:38px 34px 26px; background:linear-gradient(90deg,rgba(23,63,53,.08) 1px,transparent 1px),linear-gradient(rgba(23,63,53,.08) 1px,transparent 1px),#f7f3e8; background-size:24px 24px; border-bottom:2px solid #173f35; }
        .shared-ribbon { position:absolute; top:18px; right:-42px; width:190px; padding:7px; transform:rotate(36deg); text-align:center; background:#173f35; color:#fff; font:700 .78rem var(--font-display); z-index:2; }
        .shared-kicker,.shared-subject,.shared-stats { display:flex; align-items:center; gap:7px; color:var(--ink-faded); }
        .shared-kicker { font-family:var(--font-display); color:#173f35; font-weight:700; }
        .shared-paper h1 { font-size:clamp(2rem,7vw,3.4rem); margin:8px 0; overflow-wrap:anywhere; }
        .shared-owner { display:flex; align-items:center; gap:12px; margin-top:22px; width:max-content; max-width:100%; padding:10px 14px; background:#fff; border:1.5px solid #173f35; border-radius:12px; }
        .shared-owner > span { display:grid; line-height:1.2; }
        .shared-owner small,.shared-owner em { color:var(--ink-faded); font-style:normal; font-size:.78rem; }
        .shared-stats { gap:18px; padding:16px 34px; font-family:var(--font-display); border-bottom:1.5px dashed var(--border); flex-wrap:wrap; }
        .shared-stats span { display:flex; align-items:center; gap:5px; }
        .shared-preview { display:grid; gap:10px; margin:24px 34px; }
        .shared-preview h2 { font-size:1.15rem; }
        .shared-preview-row { display:flex; align-items:flex-start; gap:12px; padding:12px 14px; border:1.5px solid var(--border); border-radius:10px; background:var(--paper); }
        .shared-preview-row > span { display:grid; place-items:center; flex:0 0 28px; width:28px; height:28px; border-radius:50%; background:#173f35; color:#fff; font:700 .82rem var(--font-display); }
        .shared-notes { margin:22px 34px; white-space:pre-wrap; overflow-wrap:anywhere; }
        .shared-notes strong { display:flex; align-items:center; gap:7px; margin-bottom:6px; font-family:var(--font-display); }
        .shared-actions { display:flex; flex-wrap:wrap; gap:10px; padding:0 34px 34px; }
        .shared-state { width:min(520px,calc(100% - 32px)); margin:12vh auto; padding:36px 24px; text-align:center; display:grid; gap:14px; justify-items:center; }
        .shared-state > i { font-size:3rem; color:var(--purple); }
        @media (max-width:480px) { .shared-cover { padding:34px 18px 22px; } .shared-stats { padding:14px 18px; gap:10px 16px; } .shared-preview,.shared-notes { margin:20px 18px; } .shared-actions { padding:0 18px 24px; } .shared-actions .btn-sketch { width:100%; justify-content:center; } }
      `}</style>
    </main>
  );
}
