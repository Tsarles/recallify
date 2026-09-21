import { useCallback, useEffect, useState } from 'react';
import Header      from '../components/Header';
import Footer      from '../components/Footer';
import Decklist    from '../components/Decklist';
import PasteInput  from '../components/PasteInput';
import QuizEngine  from './QuizEngine';
import Landing     from './Landing';
import Archive     from './Archive';
import SuggestionModal from '../components/SuggestionModal';
import AuthModal from '../components/AuthModal';
import SharedDeck from './SharedDeck';
import { supabase } from '../lib/supabase';
import { createDeck, listDecks } from '../utils/decks';

export default function Home() {
  // view: 'landing' | 'decks' | 'paste' | 'quiz' | 'archive'
  const [view,        setView]       = useState('landing');
  const [activeDeck,  setActiveDeck] = useState(null);
  const [quizMode,    setQuizMode]   = useState('quiz');
  const [toast,       setToast]      = useState('');
  const [showSuggest, setShowSuggest] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [user, setUser] = useState(null);
  const [dataVersion, setDataVersion] = useState(0);
  const [sharedQuiz, setSharedQuiz] = useState(null);
  const [sharedDeckId, setSharedDeckId] = useState(() => new URLSearchParams(window.location.search).get('deck'));

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user || null));
    return () => data.subscription.unsubscribe();
  }, []);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }, []);

  const handleNav = (target) => setView(target);

  const handleCreateDeck = async (deckData) => {
    try {
      await createDeck(deckData, user?.id);
      const count = (await listDecks(user?.id)).length;
      setDataVersion((version) => version + 1);
      showToast(`Saved! "${deckData.title}" — ${count}/5 decks used.`);
      setView('decks');
    } catch (e) {
      showToast(`Error: ${e.message}`);
    }
  };

  const handleSelectDeck = (deck, mode) => {
    setActiveDeck(deck);
    setQuizMode(mode);
    setView('quiz');
  };

  const handleQuizFinish = async (nextMode) => {
    if (nextMode === 'review') {
      const fresh = (await listDecks(user?.id)).find((d) => d.id === activeDeck.id);
      setActiveDeck(fresh || activeDeck);
      setQuizMode('review');
    }
  };

  const handleQuizBack = () => {
    setActiveDeck(null);
    setView('decks');
  };

  const isLanding = view === 'landing';
  const isQuiz    = view === 'quiz';

  const leaveSharedDeck = () => {
    window.history.replaceState({}, '', window.location.pathname);
    setSharedDeckId(null);
    setSharedQuiz(null);
    setView('landing');
  };

  if (sharedDeckId && !sharedQuiz) {
    return (
      <>
        <SharedDeck deckId={sharedDeckId} user={user} onBack={leaveSharedDeck} onStudy={setSharedQuiz} onAccount={() => setShowAccount(true)} onToast={showToast} />
        {showAccount && <AuthModal user={user} onClose={() => setShowAccount(false)} onChanged={() => setDataVersion((v) => v + 1)} onToast={showToast} />}
        {toast && <div className={`toast ${toast.startsWith('Error:') ? 'toast-error' : 'toast-success'}`}>{toast}</div>}
      </>
    );
  }

  if (sharedQuiz) {
    return <QuizEngine deck={sharedQuiz} userId={null} mode="quiz" onFinish={() => {}} onBack={() => setSharedQuiz(null)} />;
  }

  return (
    <div className="app-shell">
      {!isLanding && (
        <Header view={view} user={user} onNav={handleNav} onSuggest={() => setShowSuggest(true)} onAccount={() => setShowAccount(true)} />
      )}

      <main className="app-main">
        {view === 'landing' && (
          <Landing onGetStarted={() => setView('decks')} />
        )}

        {view === 'decks' && (
          <Decklist
            onSelectDeck={handleSelectDeck}
            onAddDeck={() => setView('paste')}
            onShowToast={showToast}
            userId={user?.id}
            refreshKey={dataVersion}
          />
        )}

        {view === 'paste' && (
          <PasteInput onCreateDeck={handleCreateDeck} />
        )}

        {view === 'quiz' && activeDeck && (
          <QuizEngine
            deck={activeDeck}
            userId={user?.id}
            mode={quizMode}
            onFinish={handleQuizFinish}
            onBack={handleQuizBack}
          />
        )}

        {view === 'archive' && (
          <Archive onShowToast={showToast} userId={user?.id} refreshKey={dataVersion} />
        )}
      </main>

      {/* Footer — shown on inner pages only */}
      {!isLanding && !isQuiz && (
        <Footer onSuggest={() => setShowSuggest(true)} />
      )}

      {/* Toast notification */}
      {toast && (
        <div className={`toast ${toast.startsWith('Error:') ? 'toast-error' : 'toast-success'}`}>
          {toast.startsWith('Error:') ? <i className="bx bx-error-circle" /> : <i className="bx bx-check-circle" />}
          {' '}{toast}
        </div>
      )}

      {/* Global suggestion modal */}
      {showSuggest && <SuggestionModal onClose={() => setShowSuggest(false)} />}
      {showAccount && <AuthModal user={user} onClose={() => setShowAccount(false)} onChanged={() => setDataVersion((v) => v + 1)} onToast={showToast} />}

      <style>{`
        .app-shell {
          display: flex;
          flex-direction: column;
          min-height: 100svh;
        }

        .app-main {
          flex: 1;
          width: 100%;
        }

        /* Toast */
        .toast {
          position: fixed;
          bottom: 28px;
          left: 50%;
          transform: translateX(-50%);
          font-family: var(--font-display);
          font-size: 1rem;
          padding: 12px 24px;
          border: 2.5px solid var(--ink);
          border-radius: var(--r-btn);
          box-shadow: 4px 4px 0 var(--ink);
          z-index: 9999;
          white-space: nowrap;
          animation: bounceIn 0.3s ease;
          max-width: 90vw;
          text-align: center;
        }

        .toast-success { background: var(--correct-bg); color: var(--correct); }
        .toast-error   { background: var(--wrong-bg);   color: var(--wrong); }

        @media (max-width: 480px) {
          .toast { font-size: 0.88rem; padding: 10px 16px; bottom: 16px; }
        }
      `}</style>
    </div>
  );
}
