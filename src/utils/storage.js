/**
 * Recallify localStorage helpers v2
 * - Up to 5 active decks
 * - Archive (auto-delete after 30 days)
 * - Quiz history, hearts, suggestions
 */

const DECKS_KEY       = 'recallify_decks';
const HEARTS_KEY      = 'recallify_hearts';
const SUGGESTIONS_KEY = 'recallify_suggestions';
const MAX_DECKS       = 5;
const ARCHIVE_DAYS    = 30;

// ── Helpers ──────────────────────────────────────────────────

function readDecks() {
  try { return JSON.parse(localStorage.getItem(DECKS_KEY)) || []; }
  catch { return []; }
}

function writeDecks(decks) {
  localStorage.setItem(DECKS_KEY, JSON.stringify(decks));
}

// ── Active decks ─────────────────────────────────────────────

export function loadDecks() {
  // Returns non-archived decks and runs cleanup
  cleanupExpiredArchive();
  return readDecks().filter(d => !d.archivedAt);
}

export function loadArchivedDecks() {
  return readDecks().filter(d => !!d.archivedAt);
}

export function getDeckCount() {
  return loadDecks().length;
}

export function canAddDeck() {
  return getDeckCount() < MAX_DECKS;
}

export function saveDeck(deck) {
  const all = readDecks();
  const active = all.filter(d => !d.archivedAt);
  if (active.length >= MAX_DECKS) {
    throw new Error(`You already have ${MAX_DECKS} decks. Delete or archive one first!`);
  }
  const newDeck = {
    id:           Date.now().toString(),
    title:        deck.title   || 'Untitled Deck',
    subject:      deck.subject || '',
    cards:        deck.cards   || [],
    timerSeconds: deck.timerSeconds || 20,
    createdAt:    new Date().toISOString(),
    archivedAt:   null,
    history:      [],
  };
  all.push(newDeck);
  writeDecks(all);
  return newDeck;
}

export function updateDeck(deckId, updates) {
  const all = readDecks();
  const idx = all.findIndex(d => d.id === deckId);
  if (idx === -1) return;
  all[idx] = { ...all[idx], ...updates };
  writeDecks(all);
  return all[idx];
}

export function deleteDeck(deckId) {
  writeDecks(readDecks().filter(d => d.id !== deckId));
}

export function archiveDeck(deckId) {
  updateDeck(deckId, { archivedAt: new Date().toISOString() });
}

export function restoreDeck(deckId) {
  const all = readDecks();
  const active = all.filter(d => !d.archivedAt);
  if (active.length >= MAX_DECKS) {
    throw new Error(`Can't restore — you already have ${MAX_DECKS} active decks!`);
  }
  updateDeck(deckId, { archivedAt: null });
}

export function cleanupExpiredArchive() {
  const all   = readDecks();
  const cutoff = Date.now() - ARCHIVE_DAYS * 24 * 60 * 60 * 1000;
  const kept  = all.filter(d => {
    if (!d.archivedAt) return true;
    return new Date(d.archivedAt).getTime() > cutoff;
  });
  if (kept.length !== all.length) writeDecks(kept);
}

export function daysUntilExpiry(archivedAt) {
  const elapsed = Date.now() - new Date(archivedAt).getTime();
  const daysDone = elapsed / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.ceil(ARCHIVE_DAYS - daysDone));
}

// ── Quiz history ─────────────────────────────────────────────

export function saveQuizResult(deckId, { score, total, wrongIds, timeTaken }) {
  const all  = readDecks();
  const deck = all.find(d => d.id === deckId);
  if (!deck) return;
  if (!deck.history) deck.history = [];
  deck.history.push({
    date:      new Date().toISOString(),
    score,
    total,
    wrongIds:  wrongIds || [],
    timeTaken: timeTaken || 0,
  });
  writeDecks(all);
}

// ── Hearts ───────────────────────────────────────────────────

export function loadHearts() {
  return parseInt(localStorage.getItem(HEARTS_KEY) || '0', 10);
}

export function addHeart() {
  const h = loadHearts() + 1;
  localStorage.setItem(HEARTS_KEY, String(h));
  return h;
}

export function hasHearted() {
  return localStorage.getItem(HEARTS_KEY + '_user') === 'yes';
}

export function setHearted() {
  localStorage.setItem(HEARTS_KEY + '_user', 'yes');
}

// ── Suggestions ──────────────────────────────────────────────

export function saveSuggestion(text) {
  const list = loadSuggestions();
  list.push({ text, date: new Date().toISOString() });
  localStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(list));
}

export function loadSuggestions() {
  try { return JSON.parse(localStorage.getItem(SUGGESTIONS_KEY)) || []; }
  catch { return []; }
}
