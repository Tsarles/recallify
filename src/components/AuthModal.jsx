import { useEffect, useState } from 'react';
import { cloudEnabled, supabase } from '../lib/supabase';
import { loadArchivedDecks, loadDecks } from '../utils/storage';
import { migrateLocalDecks } from '../utils/decks';
import { confirmUsername, ensureProfile, isUsernameAvailable, normalizeUsername, signInWithIdentifier, validateUsername } from '../utils/profiles';

export default function AuthModal({ user, onClose, onChanged, onToast }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [usernameSetup, setUsernameSetup] = useState(null);
  const localCount = loadDecks().length + loadArchivedDecks().length;

  useEffect(() => {
    if (!user) return;
    let active = true;
    ensureProfile(user).then((profile) => {
      if (active && !profile.username_confirmed) {
        setUsername(profile.username.startsWith('learner_') ? '' : profile.username);
        setUsernameSetup({ user, profile });
      }
    }).catch((profileError) => active && setError(profileError.message));
    return () => { active = false; };
  }, [user]);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (mode === 'signup') {
        const normalizedUsername = normalizeUsername(username);
        if (!validateUsername(normalizedUsername)) throw new Error('Username must be 3–24 lowercase letters, numbers, or underscores.');
        if (!displayName.trim()) throw new Error('Please add a display name.');
        if (password !== confirmPassword) throw new Error('Passwords do not match.');
        if (!(await isUsernameAvailable(normalizedUsername))) throw new Error('That username is already taken.');
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username: normalizedUsername, display_name: displayName.trim().slice(0, 50) } },
        });
        if (authError) throw authError;
        if (data.session && data.user) await ensureProfile(data.user);
        if (data.session) {
          onToast('Account created. Welcome to Recallify V1.2.1.');
          onClose();
        } else {
          setConfirmationSent(true);
          onToast('Check your email to confirm your Recallify account.');
        }
      } else {
        const { data, error: authError } = await signInWithIdentifier(email, password);
        if (authError) throw authError;
        if (data.user) {
          const profile = await ensureProfile(data.user);
          if (!profile.username_confirmed) {
            setUsername(profile.username.startsWith('learner_') ? '' : profile.username);
            setUsernameSetup({ user: data.user, profile });
            return;
          }
        }
        onClose();
      }
    } catch (authError) {
      setError(authError.message);
    } finally {
      setBusy(false);
    }
  };

  const saveUsername = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await confirmUsername(usernameSetup.user.id, username);
      onToast(`Username @${normalizeUsername(username)} is ready for your next sign-in.`);
      onChanged?.();
      onClose();
    } catch (usernameError) {
      setError(usernameError.message);
    } finally {
      setBusy(false);
    }
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
        <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close account dialog"><i className="bx bx-x" /></button>
        <i className="bx bx-user-circle auth-icon" />
        <h2 id="auth-title">{user ? 'Your Recallify account' : mode === 'login' ? 'Welcome back' : 'Create an account'}</h2>

        {!cloudEnabled ? (
          <p className="auth-error">Cloud sync needs the Supabase environment variables from <code>.env.example</code>.</p>
        ) : usernameSetup ? (
          <form className="auth-stack username-setup" onSubmit={saveUsername}>
            <div className="username-setup-icon"><i className="bx bx-id-card" /></div>
            <div>
              <p><strong>Choose your sign-in username</strong></p>
              <p className="text-faded">Your email still handles confirmation and recovery. Once saved, you can use either your username or email next time.</p>
            </div>
            <label>Username<input autoFocus className="sketch-input" type="text" autoComplete="username" minLength="3" maxLength="24" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} placeholder="study_name" required /></label>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="btn-sketch primary" disabled={busy}>{busy ? 'Saving…' : 'Save Username'}</button>
            <button type="button" className="auth-switch" onClick={onClose}>Not now — use email next time</button>
          </form>
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
        ) : confirmationSent ? (
          <div className="auth-stack auth-confirmation">
            <i className="bx bx-mail-send" />
            <p><strong>Confirm your email</strong></p>
            <p className="text-faded">We sent a confirmation link to <strong>{email}</strong>. After confirming it, sign in with your username-ready account.</p>
            <button className="btn-sketch primary" onClick={onClose}>Done</button>
          </div>
        ) : (
          <form className="auth-stack" onSubmit={submit}>
            {mode === 'signup' && (
              <>
                <label>Username<input className="sketch-input" type="text" autoComplete="username" minLength="3" maxLength="24" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} placeholder="study_name" required /></label>
                <label>Display name<input className="sketch-input" type="text" autoComplete="name" maxLength="50" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" required /></label>
              </>
            )}
            <label>{mode === 'login' ? 'Username or email' : 'Email'}<input className="sketch-input" type={mode === 'login' ? 'text' : 'email'} autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={mode === 'login' ? 'study_name or you@example.com' : 'you@example.com'} required /></label>
            <label>Password<input className="sketch-input" type="password" minLength="6" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
            {mode === 'signup' && <label>Confirm password<input className="sketch-input" type="password" minLength="6" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></label>}
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="btn-sketch primary" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}</button>
            <button type="button" className="auth-switch" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setConfirmationSent(false); }}>
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
          .auth-confirmation { text-align:center; align-items:center; }
          .auth-confirmation > i { font-size:3rem; color:var(--purple); }
          .username-setup { text-align:left; }
          .username-setup-icon { width:52px; height:52px; display:grid; place-items:center; border:2px solid var(--ink); border-radius:14px; background:var(--yellow-bg); box-shadow:3px 3px 0 var(--ink); font-size:1.6rem; }
          @media (max-width:480px) { .auth-card { padding:28px 18px 20px; } }
        `}</style>
      </section>
    </div>
  );
}
