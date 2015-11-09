/*
 * Copyright (c) 2015 by Greg Reimer <gregreimer@gmail.com>
 * MIT License. See mit-license.txt for more info.
 */

/* eslint-env mocha */

import assert from 'assert';
import { expensiveWalkObject } from '../src/walk-object';

describe('walk-object', () => {

  it('should do nothing for an empty object', () => {
    assert.deepEqual([...expensiveWalkObject({})], []);
  });

  it('should do nothing for an empty array', () => {
    assert.deepEqual([...expensiveWalkObject([])], []);
  });

  it('should do nothing for undefined', () => {
    assert.deepEqual([...expensiveWalkObject(undefined)], []);
  });

  it('should do nothing for null', () => {
    assert.deepEqual([...expensiveWalkObject(null)], []);
  });

  it('should do nothing for a primitive', () => {
    assert.deepEqual([...expensiveWalkObject(1)], []);
  });

  it('should walk top-level props', () => {
    const result = [...expensiveWalkObject({ a:1, b:2 })];
    assert.deepEqual(result, [
      { path: ['a'], value: 1, parents: [{ a:1, b:2 }] },
      { path: ['b'], value: 2, parents: [{ a:1, b:2 }] }
    ]);
  });

  it('should walk top-level array items', () => {
    const result = [...expensiveWalkObject([2,4])];
    assert.deepEqual(result, [
      { path: [0], value: 2, parents: [[2,4]] },
      { path: [1], value: 4, parents: [[2,4]] }
    ]);
  });

  it('should pass null as a value', () => {
    const result = [...expensiveWalkObject([null])];
    assert.deepEqual(result, [
      { path: [0], value: null, parents: [[null]] }
    ]);
  });

  it('should go two levels deep', () => {
    const result = [...expensiveWalkObject([{a:1},3])];
    assert.deepEqual(result, [
      { path: [0], value: {a:1}, parents: [[{a:1},3]] },
      { path: [0,'a'], value: 1, parents: [[{a:1},3], {a:1}] },
      { path: [1], value: 3, parents: [[{a:1},3]] }
    ]);
  });
});
