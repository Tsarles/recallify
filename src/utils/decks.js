import { supabase } from '../lib/supabase';
import * as local from './storage';

const MAX_DECKS = 5;

const fromRow = (row) => ({
  id: row.id,
  title: row.title,
  subject: row.subject,
  cards: row.cards,
  timerSeconds: row.timer_seconds,
  history: row.history,
  archivedAt: row.archived_at,
  createdAt: row.created_at,
  isPublic: row.is_public,
});

const toRow = (deck, userId) => ({
  user_id: userId,
  title: deck.title || 'Untitled Deck',
  subject: deck.subject || '',
  cards: deck.cards || [],
  timer_seconds: deck.timerSeconds || 20,
  history: deck.history || [],
  archived_at: deck.archivedAt || null,
  is_public: deck.isPublic || false,
});

function requireCloud() {
  if (!supabase) throw new Error('Cloud sync is not configured yet.');
}

export async function listDecks(userId, archived = false) {
  if (!userId) return archived ? local.loadArchivedDecks() : local.loadDecks();
  requireCloud();
  if (archived) {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { error: cleanupError } = await supabase.from('decks').delete().eq('user_id', userId).lt('archived_at', cutoff);
    if (cleanupError) throw cleanupError;
  }
  let query = supabase
    .from('decks')
    .select('*')
    .eq('user_id', userId);
  query = archived ? query.not('archived_at', 'is', null) : query.is('archived_at', null);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(fromRow);
}

export async function createDeck(deck, userId) {
  if (!userId) return local.saveDeck(deck);
  const active = await listDecks(userId);
  if (active.length >= MAX_DECKS) throw new Error(`You already have ${MAX_DECKS} decks. Delete or archive one first!`);
  const { data, error } = await supabase.from('decks').insert(toRow(deck, userId)).select().single();
  if (error) throw error;
  return fromRow(data);
}

export async function updateDeck(deckId, updates, userId) {
  if (!userId) return local.updateDeck(deckId, updates);
  const patch = {};
  if ('title' in updates) patch.title = updates.title;
  if ('subject' in updates) patch.subject = updates.subject;
  if ('cards' in updates) patch.cards = updates.cards;
  if ('timerSeconds' in updates) patch.timer_seconds = updates.timerSeconds;
  if ('history' in updates) patch.history = updates.history;
  if ('archivedAt' in updates) patch.archived_at = updates.archivedAt;
  if ('isPublic' in updates) patch.is_public = updates.isPublic;
  patch.updated_at = new Date().toISOString();
  const { data, error } = await supabase.from('decks').update(patch).eq('id', deckId).eq('user_id', userId).select().single();
  if (error) throw error;
  return fromRow(data);
}

export async function removeDeck(deckId, userId) {
  if (!userId) return local.deleteDeck(deckId);
  const { error } = await supabase.from('decks').delete().eq('id', deckId).eq('user_id', userId);
  if (error) throw error;
}

export const archiveDeck = (id, userId) => updateDeck(id, { archivedAt: new Date().toISOString() }, userId);
export const restoreDeck = (id, userId) => updateDeck(id, { archivedAt: null }, userId);

export async function saveQuizResult(deck, result, userId) {
  if (!userId) return local.saveQuizResult(deck.id, result);
  const history = [...(deck.history || []), { date: new Date().toISOString(), ...result }];
  return updateDeck(deck.id, { history }, userId);
}

export async function migrateLocalDecks(userId) {
  const decks = [...local.loadDecks(), ...local.loadArchivedDecks()];
  if (!decks.length) return 0;
  const rows = decks.map((deck) => toRow(deck, userId));
  const { error } = await supabase.from('decks').insert(rows);
  if (error) throw error;
  decks.forEach((deck) => local.deleteDeck(deck.id));
  return decks.length;
}

export async function getSharedDeck(id) {
  requireCloud();
  const { data, error } = await supabase.from('decks').select('*').eq('id', id).eq('is_public', true).single();
  if (error) throw error;
  return fromRow(data);
}

export async function copySharedDeck(deck, userId) {
  return createDeck({ ...deck, title: `${deck.title} (Copy)`, history: [], archivedAt: null, isPublic: false }, userId);
}

export const getShareUrl = (deckId) => `${window.location.origin}${window.location.pathname}?deck=${deckId}`;
