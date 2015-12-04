/*
 * Copyright (c) 2015 by Greg Reimer <gregreimer@gmail.com>
 * MIT License. See mit-license.txt for more info.
 */

/* eslint-env mocha */

import assert from 'assert';
import PatternMap from '../src/pattern-map';

describe('pattern-map', () => {

  it('should get a zero-level path', () => {
    const map = new PatternMap();
    map.set([], 0);
    assert.strictEqual(map.get([]), 0);
  });

  it('should get a one-level path', () => {
    const map = new PatternMap();
    map.set(['a'], 1);
    assert.strictEqual(map.get(['a']), 1);
  });

  it('should get a two-level path', () => {
    const map = new PatternMap();
    map.set(['b','c'], 2);
    assert.strictEqual(map.get(['b','c']), 2);
  });

  it('should get a two-level path containing a number', () => {
    const map = new PatternMap();
    map.set(['b', 9], 2);
    assert.strictEqual(map.get(['b', 9]), 2);
  });

  it('should not get a zero-level path', () => {
    const map = new PatternMap();
    assert.strictEqual(map.get([]), undefined);
  });

  it('should not get a one-level path', () => {
    const map = new PatternMap();
    assert.strictEqual(map.get(['a']), undefined);
  });

  it('should not get a two-level path', () => {
    const map = new PatternMap();
    assert.strictEqual(map.get(['b','c']), undefined);
  });

  it('should get a one-level path with a key from string', () => {
    const map = new PatternMap();
    map.set(['$key'], 1);
    assert.strictEqual(map.get(['a']), 1);
  });

  it('should get a one-level path with a key from number', () => {
    const map = new PatternMap();
    map.set(['$key'], 3);
    assert.strictEqual(map.get([2]), 3);
  });

  it('should get a two-level path with a key from string', () => {
    const map = new PatternMap();
    map.set(['$key', 'b'], 1);
    assert.strictEqual(map.get(['a','b']), 1);
  });

  it('should get a two-level path with a key from number', () => {
    const map = new PatternMap();
    map.set([8, '$key'], 3);
    assert.strictEqual(map.get([8, 2]), 3);
  });

  it('should get a one-level path with an index from 0', () => {
    const map = new PatternMap();
    map.set(['$index'], 1);
    assert.strictEqual(map.get([0]), 1);
  });

  it('should get a one-level path with an index from 1', () => {
    const map = new PatternMap();
    map.set(['$index'], 1);
    assert.strictEqual(map.get([1]), 1);
  });

  it('should not get a one-level path with an index from -1', () => {
    const map = new PatternMap();
    map.set(['$index'], 1);
    assert.strictEqual(map.get([-1]), undefined);
  });

  it('should not get a one-level path with an index from a string', () => {
    const map = new PatternMap();
    map.set(['$index'], 1);
    assert.strictEqual(map.get(['1']), undefined);
  });

  it('should get a two-level path with an index', () => {
    const map = new PatternMap();
    map.set(['$index', 'foo'], 1);
    assert.strictEqual(map.get([0, 'foo']), 1);
  });

  it('real value should override key', () => {
    const map = new PatternMap();
    map.set(['$key', 'foo'], 1);
    map.set(['bar', 'foo'], 2);
    assert.strictEqual(map.get(['bar', 'foo']), 2);
  });

  it('real value should override index', () => {
    const map = new PatternMap();
    map.set([1, 'foo'], 2);
    map.set(['$index', 'foo'], 1);
    assert.strictEqual(map.get([1, 'foo']), 2);
  });
});
