import { AVATAR_PRESETS } from '../utils/profiles';

export default function ProfileAvatar({ avatarKey = 'pencil', size = 'large' }) {
  const avatar = AVATAR_PRESETS.find((item) => item.key === avatarKey) || AVATAR_PRESETS[0];
  return (
    <span className={`profile-avatar profile-avatar--${size}`} style={{ '--avatar-color': avatar.color }} aria-label={avatar.label} role="img">
      <i className={`bx ${avatar.icon}`} />
      <span className="avatar-pencil-line" />
      <style>{`
        .profile-avatar { position:relative; display:inline-grid; place-items:center; flex-shrink:0; background:var(--avatar-color); border:2.5px solid var(--ink); border-radius:46% 54% 48% 52%; box-shadow:3px 3px 0 var(--ink); overflow:hidden; }
        .profile-avatar--small { width:34px; height:34px; font-size:1.05rem; box-shadow:2px 2px 0 var(--ink); }
        .profile-avatar--medium { width:54px; height:54px; font-size:1.5rem; }
        .profile-avatar--large { width:92px; height:92px; font-size:2.8rem; }
        .profile-avatar i { position:relative; z-index:1; color:var(--ink); }
        .avatar-pencil-line { position:absolute; width:120%; height:2px; background:rgba(30,26,20,.18); transform:rotate(-18deg); }
      `}</style>
    </span>
  );
}
