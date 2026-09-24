import { useEffect, useState } from 'react';
import ProfileAvatar from '../components/ProfileAvatar';
import { AVATAR_PRESETS, ensureProfile, isUsernameAvailable, SUBJECT_INTERESTS, updateProfile, validateUsername } from '../utils/profiles';

export default function Profile({ user, onBack, onToast }) {
  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarKey, setAvatarKey] = useState('pencil');
  const [interests, setInterests] = useState([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    ensureProfile(user)
      .then((next) => {
        if (!active) return;
        setProfile(next);
        setUsername(next.username);
        setDisplayName(next.display_name);
        setBio(next.bio || '');
        setAvatarKey(next.avatar_key || 'pencil');
        setInterests(next.interests || []);
      })
      .catch((loadError) => active && setError(loadError.message))
      .finally(() => active && setBusy(false));
    return () => { active = false; };
  }, [user]);

  const toggleInterest = (subject) => {
    setInterests((current) => current.includes(subject)
      ? current.filter((item) => item !== subject)
      : current.length < 8 ? [...current, subject] : current);
  };

  const save = async (event) => {
    event.preventDefault();
    setError('');
    const normalized = username.toLowerCase().trim();
    if (!validateUsername(normalized)) return setError('Username must be 3–24 lowercase letters, numbers, or underscores.');
    if (!displayName.trim()) return setError('Please add a display name.');
    setBusy(true);
    try {
      if (!(await isUsernameAvailable(normalized, user.id))) throw new Error('That username is already taken.');
      const next = await updateProfile(user.id, { username: normalized, displayName, bio, avatarKey, interests });
      setProfile(next);
      setUsername(next.username);
      onToast('Profile saved.');
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setBusy(false);
    }
  };

  if (busy && !profile) return <div className="profile-loading"><i className="bx bx-loader-alt bx-spin" /> Loading your profile…</div>;

  return (
    <div className="profile-page inner-page-wrap">
      <div className="profile-heading-row">
        <button className="btn-sketch" onClick={onBack}><i className="bx bx-arrow-back" /> Back to Decks</button>
        <span className="version-chip">Recallify V1.2.1</span>
      </div>
      <form className="profile-sheet sketch-card" onSubmit={save}>
        <div className="profile-intro">
          <ProfileAvatar avatarKey={avatarKey} />
          <div>
            <p className="section-eyebrow"><i className="bx bx-id-card" /> Your account page</p>
            <h1>{displayName || username || 'Recallify learner'}</h1>
            <p className="text-faded">@{username || 'username'}</p>
          </div>
        </div>

        <section className="profile-section">
          <h2>Choose a notebook avatar</h2>
          <div className="avatar-grid">
            {AVATAR_PRESETS.map((avatar) => (
              <button key={avatar.key} type="button" className={`avatar-choice ${avatarKey === avatar.key ? 'selected' : ''}`} onClick={() => setAvatarKey(avatar.key)} aria-label={`Use ${avatar.label} avatar`}>
                <ProfileAvatar avatarKey={avatar.key} size="medium" /><span>{avatar.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="profile-section profile-fields">
          <label>Username<input className="sketch-input" value={username} onChange={(event) => setUsername(event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} maxLength={24} required /></label>
          <label>Display name<input className="sketch-input" value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={50} required /></label>
          <label className="profile-wide">Bio<textarea className="sketch-textarea" rows={4} value={bio} onChange={(event) => setBio(event.target.value)} maxLength={240} placeholder="What are you studying, and what keeps you curious?" /><span className="field-count">{bio.length}/240</span></label>
        </section>

        <section className="profile-section">
          <h2>Interested subjects</h2>
          <p className="text-faded">Choose up to 8. These help make your account feel like yours.</p>
          <div className="interest-grid">
            {SUBJECT_INTERESTS.map((subject) => <button key={subject} type="button" className={`interest-chip ${interests.includes(subject) ? 'selected' : ''}`} onClick={() => toggleInterest(subject)}>{subject}</button>)}
          </div>
        </section>

        {error && <p className="profile-error" role="alert">{error}</p>}
        <button className="btn-sketch primary profile-save" disabled={busy}><i className="bx bxs-save" /> {busy ? 'Saving…' : 'Save Profile'}</button>
      </form>
      <style>{`
        .profile-page { width:min(900px,100%); margin:0 auto; padding:28px 20px 64px; }
        .profile-loading { min-height:60vh; display:grid; place-items:center; font-family:var(--font-display); }
        .profile-heading-row { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:22px; }
        .version-chip { font-family:var(--font-display); font-weight:700; padding:6px 12px; border:2px solid var(--ink); border-radius:99px; background:var(--yellow); }
        .profile-sheet { padding:30px; display:grid; gap:26px; background:#fff; }
        .profile-intro { display:flex; align-items:center; gap:22px; border-bottom:2px dashed var(--border); padding-bottom:24px; }
        .profile-intro h1 { margin:4px 0; overflow-wrap:anywhere; }
        .profile-section { display:grid; gap:12px; }
        .profile-section h2 { font-size:1.2rem; }
        .avatar-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(94px,1fr)); gap:12px; }
        .avatar-choice { border:2px solid var(--border); background:var(--paper); border-radius:12px; padding:12px 8px; cursor:pointer; display:grid; justify-items:center; gap:8px; font:600 .85rem var(--font-display); }
        .avatar-choice.selected { border-color:var(--ink); background:var(--yellow-bg); box-shadow:3px 3px 0 var(--ink); }
        .profile-fields { grid-template-columns:1fr 1fr; }
        .profile-fields label { display:grid; gap:6px; font:600 .95rem var(--font-display); }
        .profile-wide { grid-column:1/-1; }
        .field-count { justify-self:end; color:var(--ink-faded); font-size:.8rem; }
        .interest-grid { display:flex; flex-wrap:wrap; gap:8px; }
        .interest-chip { border:2px solid var(--border); background:#fff; border-radius:99px; padding:7px 12px; cursor:pointer; font:600 .88rem var(--font-display); }
        .interest-chip.selected { background:var(--green-bg); border-color:var(--green); box-shadow:2px 2px 0 var(--ink); }
        .profile-error { color:var(--wrong); background:var(--wrong-bg); border:1px solid var(--wrong); border-radius:8px; padding:9px 11px; }
        .profile-save { justify-self:start; }
        @media (max-width:600px) { .profile-page { padding:18px 12px 48px; } .profile-sheet { padding:22px 16px; } .profile-intro { align-items:flex-start; } .profile-fields { grid-template-columns:1fr; } .profile-wide { grid-column:auto; } .avatar-grid { grid-template-columns:repeat(2,1fr); } }
      `}</style>
    </div>
  );
}
