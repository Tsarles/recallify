import test from 'node:test';
import assert from 'node:assert/strict';
import { parseQuizText } from '../src/utils/parser.js';

test('parses Recallify multiple-choice format', () => {
  const cards = parseQuizText(`1. What is 2 + 2?
A. 3
B. 4
C. 5
D. 6
// correct answer B`);

  assert.equal(cards.length, 1);
  assert.equal(cards[0].question, 'What is 2 + 2?');
  assert.equal(cards[0].answerId, 'B');
  assert.equal(cards[0].options.length, 4);
});
