/*
 * Copyright (c) 2015 by Greg Reimer <gregreimer@gmail.com>
 * MIT License. See mit-license.txt for more info.
 */

/* eslint-env mocha */

import assert from 'assert';
import { isLeafNode, expensiveWalkObject } from '../src/walk-object';
import $ref from '../src/ref';

describe('walk-object', () => {

  describe('isLeaf', () => {

    it('should identify ref as leaf node', () => {
      assert(isLeafNode($ref(['foo','bar'])));
    });

    it('should identify atom as leaf node', () => {
      assert(isLeafNode({ $type: 'atom' }));
    });

    it('should identify error as leaf node', () => {
      assert(isLeafNode({ $type: 'error', value: 'foo' }));
    });

    it('should identify `1` as leaf node', () => {
      assert(isLeafNode(1));
    });

    it('should identify `undefined` as leaf node', () => {
      assert(isLeafNode(undefined));
    });

    it('should identify `null` as leaf node', () => {
      assert(isLeafNode(null));
    });

    it('should identify `"foo"` as leaf node', () => {
      assert(isLeafNode("foo"));
    });

    it('should identify `{}` as branch node', () => {
      assert(!isLeafNode({}));
    });

    it('should identify `[]` as branch node', () => {
      assert(!isLeafNode([]));
    });
  });

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
      { path: ['a'], value: 1, parents: [{ a:1, b:2 }], isLeaf: true },
      { path: ['b'], value: 2, parents: [{ a:1, b:2 }], isLeaf: true }
    ]);
  });

  it('should walk top-level array items', () => {
    const result = [...expensiveWalkObject([2,4])];
    assert.deepEqual(result, [
      { path: [0], value: 2, parents: [[2,4]], isLeaf: true },
      { path: [1], value: 4, parents: [[2,4]], isLeaf: true }
    ]);
  });

  it('should pass null as a value', () => {
    const result = [...expensiveWalkObject([null])];
    assert.deepEqual(result, [
      { path: [0], value: null, parents: [[null]], isLeaf: true }
    ]);
  });

  it('should go two levels deep', () => {
    const result = [...expensiveWalkObject([{a:1},3])];
    assert.deepEqual(result, [
      { path: [0], value: {a:1}, parents: [[{a:1},3]], isLeaf: false },
      { path: [0,'a'], value: 1, parents: [[{a:1},3], {a:1}], isLeaf: true },
      { path: [1], value: 3, parents: [[{a:1},3]], isLeaf: true }
    ]);
  });

  it('should treat $refs as leaf nodes', () => {
    const obj = { a: $ref([ 'foo', 'bar' ]) };
    const results = new Map();
    for (const { path, value, isLeaf } of expensiveWalkObject(obj)) {
      results.set(path.join(','), value);
      if (value.$type === 'ref') {
        assert(isLeaf, 'not a leaf');
      }
    }
    assert(!results.has('a,$type'), 'ref was branch');
    assert.deepEqual(results.get('a'), $ref([ 'foo', 'bar' ]));
  });
});
