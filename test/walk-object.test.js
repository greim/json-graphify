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

  it('should iterate once for an empty object', () => {
    assert.deepEqual([...expensiveWalkObject({})], [
      { parents: [], path: [], value: {}, isLeaf: false }
    ]);
  });

  it('should iterate once for an empty array', () => {
    assert.deepEqual([...expensiveWalkObject([])], [
      { parents: [], path: [], value: [], isLeaf: false }
    ]);
  });

  it('should iterate once for undefined', () => {
    assert.deepEqual([...expensiveWalkObject(undefined)], [
      { parents: [], path: [], value: undefined, isLeaf: true }
    ]);
  });

  it('should iterate once for null', () => {
    assert.deepEqual([...expensiveWalkObject(null)], [
      { parents: [], path: [], value: null, isLeaf: true }
    ]);
  });

  it('should iterate once for a primitive', () => {
    assert.deepEqual([...expensiveWalkObject(1)], [
      { parents: [], path: [], value: 1, isLeaf: true }
    ]);
  });

  it('should walk top-level props', () => {
    const result = [...expensiveWalkObject({ a:1, b:2 })];
    assert.deepEqual(result, [
      { path: [], value: { a:1, b:2 }, parents: [], isLeaf: false },
      { path: ['a'], value: 1, parents: [{ a:1, b:2 }], isLeaf: true },
      { path: ['b'], value: 2, parents: [{ a:1, b:2 }], isLeaf: true }
    ]);
  });

  it('should walk top-level array items', () => {
    const result = [...expensiveWalkObject([2,4])];
    assert.deepEqual(result, [
      { path: [], value: [2,4], parents: [], isLeaf: false },
      { path: [0], value: 2, parents: [[2,4]], isLeaf: true },
      { path: [1], value: 4, parents: [[2,4]], isLeaf: true }
    ]);
  });

  it('should pass null as a value', () => {
    const result = [...expensiveWalkObject([null])];
    assert.deepEqual(result, [
      { path: [], value: [null], parents: [], isLeaf: false },
      { path: [0], value: null, parents: [[null]], isLeaf: true }
    ]);
  });

  it('should go two levels deep', () => {
    const result = [...expensiveWalkObject([{a:1},3])];
    assert.deepEqual(result, [
      { path: [], value: [{a:1},3], parents: [], isLeaf: false },
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
