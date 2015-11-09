/*
 * Copyright (c) 2015 by Greg Reimer <gregreimer@gmail.com>
 * MIT License. See mit-license.txt for more info.
 */

/* eslint-env mocha */

import assert from 'assert';
import match from '../src/match-paths';

describe('create-matcher', () => {

  it('should match two empty arrays', () => {
    assert(match([], []));
  });

  it('should match two one-item arrays with same contents', () => {
    assert(match(['foo'], ['foo']));
  });

  it('should not match two one-item arrays with different contents', () => {
    assert(!match(['foo'], ['bar']));
  });

  it('should not match if first array is bigger', () => {
    assert(!match(['foo','bar'], ['foo']));
  });

  it('should still match if second array is bigger', () => {
    assert(match(['foo'], ['foo','bar']));
  });

  it('should match $index to a positive integer', () => {
    assert(match(['$index'], [1]));
  });

  it('should match $index to zero', () => {
    assert(match(['$index'], [0]));
  });

  it('should not match $index to a negative integer', () => {
    assert(!match(['$index'], [-1]));
  });

  it('should not match $index to a string', () => {
    assert(!match(['$index'], ['foo']));
  });

  it('should match $index to a numeric string', () => {
    assert(match(['$index'], ['1']));
  });

  it('should match $key to 0', () => {
    assert(match(['$key'], [0]));
  });

  it('should match $key to a number', () => {
    assert(match(['$key'], [3]));
  });

  it('should match $key to false', () => {
    assert(match(['$key'], [false]));
  });

  it('should match $key to a string', () => {
    assert(match(['$key'], ['foo']));
  });

  it('should match literal indices', () => {
    assert(match(['foo', 1], ['foo', 1]));
  });

  it('should match regex', () => {
    assert(match([/foo/, 1], ['foo', 1]));
  });

  it('should match function', () => {
    assert(match([function(x) { return x === 'foo'; }, 1], ['foo', 1]));
  });
});
