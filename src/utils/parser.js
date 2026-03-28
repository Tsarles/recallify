/**
 * Recallify Quiz Parser v2
 *
 * Handles bulk paste of 1-35+ questions. Supported formats:
 *
 * 1. Question ending with ?
 * A. Option one
 * B. Option two
 * C. Option three
 * D. Option four
 * // correct answer C
 *
 * Also: "A)" style, "correct answer: C.", "Answer: C", no numbering.
 * Identification: Question without A/B/C/D options + "Answer: X"
 */

export function parseQuizText(raw) {
  const lines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  const questions = [];
  let current = null;

  // Regexes
  const OPTION_RX  = /^([A-Da-d])[.)]\s+(.+)$/;
  const CORRECT_RX = /^(?:\/\/\s*)?(?:correct\s+answer|answer)[\s:]+([A-Da-d])\.?/i;
  const NUMBER_RX  = /^\d+[.)]\s+/;
  const IDENT_ANS  = /^answer\s*:\s*(.+)$/i;

  const flush = () => {
    if (!current?.question) return;
    if (current.options.length >= 2) {
      questions.push({ ...current, type: 'multiple-choice' });
    } else if (current.options.length === 0 && current.answerId) {
      questions.push({ ...current, type: 'identification' });
    }
    current = null;
  };

  for (const line of lines) {
    // ── Correct answer marker ──────────────────────────────
    const correctM = CORRECT_RX.exec(line);
    if (correctM) {
      if (current) current.answerId = correctM[1].toUpperCase();
      continue;
    }

    // ── Option line ────────────────────────────────────────
    const optM = OPTION_RX.exec(line);
    if (optM && current) {
      current.options.push({ id: optM[1].toUpperCase(), text: optM[2].trim() });
      continue;
    }

    // ── Identification answer ──────────────────────────────
    const identM = IDENT_ANS.exec(line);
    if (identM && current && current.options.length === 0) {
      current.answerId = identM[1].trim();
      continue;
    }

    // ── New question detection ─────────────────────────────
    // A line starts a new question if:
    // (a) it has a leading number like "1." or "1)"
    // (b) it ends with "?" and no active options being built
    // (c) previous question already has options (block is done)
    const isNumbered   = NUMBER_RX.test(line);
    const isQuestion   = line.endsWith('?');
    const prevHasOpts  = current && current.options.length >= 2;

    if (isNumbered || (isQuestion && !optM) || (prevHasOpts && !optM)) {
      flush();
      const cleanQ = line.replace(NUMBER_RX, '').trim();
      current = { question: cleanQ, options: [], answerId: null };
      continue;
    }

    // ── Fallback: treat as question start ──────────────────
    if (!current) {
      current = { question: line, options: [], answerId: null };
    }
  }

  flush();
  return questions;
}