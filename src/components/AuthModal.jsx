import { useState } from 'react';
import { cloudEnabled, supabase } from '../lib/supabase';
import { loadArchivedDecks, loadDecks } from '../utils/storage';
import { migrateLocalDecks } from '../utils/decks';

export default function AuthModal({ user, onClose, onChanged, onToast }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const localCount = loadDecks().length + loadArchivedDecks().length;

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    const { error: authError } = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (authError) return setError(authError.message);
    if (mode === 'signup') onToast('Check your email to confirm your Recallify account.');
    else onClose();
  };

  const migrate = async () => {
    setBusy(true);
    try {
      const count = await migrateLocalDecks(user.id);
      onChanged();
      onToast(`${count} local deck${count === 1 ? '' : 's'} moved to your account.`);
      onClose();
    } catch (migrationError) {
      setError(migrationError.message);
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    setBusy(true);
    const { error: signOutError } = await supabase.auth.signOut();
    setBusy(false);
    if (signOutError) return setError(signOutError.message);
    onClose();
  };

  return (
    <div className="modal-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="auth-card sketch-card" aria-modal="true" role="dialog" aria-labelledby="auth-title">
        <button className="modal-close-btn" onClick={onClose} aria-label="Close account dialog"><i className="bx bx-x" /></button>
        <i className="bx bx-user-circle auth-icon" />
        <h2 id="auth-title">{user ? 'Your Recallify account' : mode === 'login' ? 'Welcome back' : 'Create an account'}</h2>

        {!cloudEnabled ? (
          <p className="auth-error">Cloud sync needs the Supabase environment variables from <code>.env.example</code>.</p>
        ) : user ? (
          <div className="auth-stack">
            <p className="auth-email"><i className="bx bx-envelope" /> {user.email}</p>
            <p className="text-faded">Your cloud decks are available whenever you sign in on another device.</p>
            {localCount > 0 && (
              <button className="btn-sketch primary" onClick={migrate} disabled={busy}>
                <i className="bx bx-cloud-upload" /> Move {localCount} local deck{localCount === 1 ? '' : 's'} to account
              </button>
            )}
            <button className="btn-sketch" onClick={signOut} disabled={busy}><i className="bx bx-log-out" /> Sign Out</button>
          </div>
        ) : (
          <form className="auth-stack" onSubmit={submit}>
            <label>Email<input className="sketch-input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
            <label>Password<input className="sketch-input" type="password" minLength="6" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="btn-sketch primary" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}</button>
            <button type="button" className="auth-switch" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}>
              {mode === 'login' ? 'New here? Create an account' : 'Already have an account? Sign in'}
            </button>
          </form>
        )}

        <style>{`
          .auth-card { width:min(430px,94vw); padding:32px 26px 26px; background:#fff; text-align:center; position:relative; }
          .auth-icon { font-size:3rem; color:var(--purple); }
          .auth-card h2 { margin:6px 0 18px; }
          .auth-stack { display:flex; flex-direction:column; gap:14px; text-align:left; }
          .auth-stack label { font-family:var(--font-display); font-weight:600; }
          .auth-stack label input { margin-top:6px; }
          .auth-email { display:flex; align-items:center; gap:7px; font-weight:700; word-break:break-word; }
          .auth-error { color:var(--wrong); background:var(--wrong-bg); border:1px solid var(--wrong); border-radius:8px; padding:9px 11px; text-align:left; }
          .auth-switch { border:0; background:none; color:var(--purple); cursor:pointer; text-decoration:underline; font:inherit; }
          @media (max-width:480px) { .auth-card { padding:28px 18px 20px; } }
        `}</style>
      </section>
    </div>
  );
}
