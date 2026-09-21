import test from 'node:test';
import assert from 'node:assert/strict';
import { shuffleCopy } from '../src/utils/shuffle.js';

test('shuffles a copy while preserving hidden answer IDs', () => {
  const original = [{ id: 'A' }, { id: 'B' }, { id: 'C' }, { id: 'D' }];
  const shuffled = shuffleCopy(original, () => 0);

  assert.deepEqual(original.map(({ id }) => id), ['A', 'B', 'C', 'D']);
  assert.deepEqual(shuffled.map(({ id }) => id), ['B', 'C', 'D', 'A']);
  assert.deepEqual(shuffled.map(({ id }) => id).sort(), ['A', 'B', 'C', 'D']);
});
