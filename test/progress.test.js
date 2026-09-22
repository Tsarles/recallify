import test from 'node:test';
import assert from 'node:assert/strict';
import { getQuizProgress } from '../src/utils/progress.js';

test('quiz progress tracks answered cards independently of accuracy', () => {
  assert.deepEqual(getQuizProgress(1, 1, 4), {
    answered: 2,
    remaining: 2,
    progressPct: 50,
    accuracyPct: 50,
  });
});

test('quiz progress is safe for empty and completed quizzes', () => {
  assert.deepEqual(getQuizProgress(0, 0, 0), {
    answered: 0,
    remaining: 0,
    progressPct: 0,
    accuracyPct: 0,
  });
  assert.equal(getQuizProgress(4, 0, 4).progressPct, 100);
});
