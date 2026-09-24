import { supabase } from '../lib/supabase';

export const SUBJECT_INTERESTS = [
  'Mathematics', 'Science', 'Programming', 'History',
  'Languages', 'Literature', 'Medicine', 'Business',
  'Arts', 'Music', 'Geography', 'Engineering',
];

export const AVATAR_PRESETS = [
  { key: 'pencil', icon: 'bxs-pencil', label: 'Pencil', color: 'var(--yellow)' },
  { key: 'book', icon: 'bxs-book-open', label: 'Open book', color: 'var(--blue)' },
  { key: 'flask', icon: 'bxs-flask', label: 'Science flask', color: 'var(--green)' },
  { key: 'planet', icon: 'bxs-planet', label: 'Planet', color: 'var(--pink)' },
  { key: 'leaf', icon: 'bxs-leaf', label: 'Leaf', color: 'var(--green)' },
  { key: 'music', icon: 'bxs-music', label: 'Music note', color: 'var(--purple-light)' },
  { key: 'code', icon: 'bx-code-alt', label: 'Code', color: 'var(--orange)' },
  { key: 'star', icon: 'bxs-star', label: 'Star', color: 'var(--yellow)' },
];

export function normalizeUsername(value = '') {
  return value.toLowerCase().trim().replace(/[^a-z0-9_]/g, '').slice(0, 24);
}

export function validateUsername(value) {
  return /^[a-z0-9_]{3,24}$/.test(value);
}

export async function isUsernameAvailable(value, currentUserId = null) {
  const username = normalizeUsername(value);
  if (!validateUsername(username)) return false;
  const { data, error } = await supabase.from('profiles').select('id').eq('username', username).maybeSingle();
  if (error) throw error;
  return !data || data.id === currentUserId;
}

export async function getProfile(userId) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getPublicProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('username, display_name, avatar_key')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function ensureProfile(user) {
  const existing = await getProfile(user.id);
  if (existing) return existing;

  const metadata = user.user_metadata || {};
  let username = normalizeUsername(metadata.username || user.email?.split('@')[0]);
  let usernameConfirmed = Boolean(metadata.username && validateUsername(username));
  if (username.length < 3 || !(await isUsernameAvailable(username))) {
    username = `learner_${user.id.replaceAll('-', '').slice(0, 8)}`;
    usernameConfirmed = false;
  }

  const profile = {
    id: user.id,
    username,
    display_name: String(metadata.display_name || username).slice(0, 50),
    bio: '',
    avatar_key: 'pencil',
    interests: [],
    username_confirmed: usernameConfirmed,
  };
  const { data, error } = await supabase.from('profiles').insert(profile).select().single();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId, updates) {
  const patch = {
    username: normalizeUsername(updates.username),
    display_name: updates.displayName.trim().slice(0, 50),
    bio: updates.bio.trim().slice(0, 240),
    avatar_key: updates.avatarKey,
    interests: updates.interests.slice(0, 8),
    username_confirmed: true,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase.from('profiles').update(patch).eq('id', userId).select().single();
  if (error) throw error;
  return data;
}

export async function confirmUsername(userId, value) {
  const username = normalizeUsername(value);
  if (!validateUsername(username)) throw new Error('Username must be 3–24 lowercase letters, numbers, or underscores.');
  if (!(await isUsernameAvailable(username, userId))) throw new Error('That username is already taken.');
  const { data, error } = await supabase
    .from('profiles')
    .update({ username, username_confirmed: true, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}


export async function signInWithIdentifier(identifier, password) {
  const value = identifier.trim().toLowerCase();
  if (value.includes('@')) {
    return supabase.auth.signInWithPassword({ email: value, password });
  }
  const username = normalizeUsername(value);
  if (!validateUsername(username)) throw new Error('Enter a valid username or email address.');

  const { data, error } = await supabase.functions.invoke('username-login', {
    body: { username, password },
  });
  if (error || !data?.access_token || !data?.refresh_token) {
    throw new Error('Incorrect username or password.');
  }
  return supabase.auth.setSession({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  });
}
