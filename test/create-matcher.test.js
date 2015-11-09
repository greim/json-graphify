/*
 * Copyright (c) 2015 by Greg Reimer <gregreimer@gmail.com>
 * MIT License. See mit-license.txt for more info.
 */

/* eslint-env mocha */

import assert from 'assert';
import createMatcher from '../src/create-matcher';

describe('create-matcher', () => {

  it('should match two empty arrays', () => {
    const $index = '$index';
    const $key = '$key';
    const match = createMatcher({ $index, $key });
    assert(match([], []));
  });

  it('should match two one-item arrays with same contents', () => {
    const $index = '$index';
    const $key = '$key';
    const match = createMatcher({ $index, $key });
    assert(match(['foo'], ['foo']));
  });

  it('should not match two one-item arrays with different contents', () => {
    const $index = '$index';
    const $key = '$key';
    const match = createMatcher({ $index, $key });
    assert(!match(['foo'], ['bar']));
  });

  it('should not match if first array is bigger', () => {
    const $index = '$index';
    const $key = '$key';
    const match = createMatcher({ $index, $key });
    assert(!match(['foo','bar'], ['foo']));
  });

  it('should still match if second array is bigger', () => {
    const $index = '$index';
    const $key = '$key';
    const match = createMatcher({ $index, $key });
    assert(match(['foo'], ['foo','bar']));
  });

  it('should match $index to a positive integer', () => {
    const $index = '$index';
    const $key = '$key';
    const match = createMatcher({ $index, $key });
    assert(match(['$index'], [1]));
  });

  it('should match $index to zero', () => {
    const $index = '$index';
    const $key = '$key';
    const match = createMatcher({ $index, $key });
    assert(match(['$index'], [0]));
  });

  it('should not match $index to a negative integer', () => {
    const $index = '$index';
    const $key = '$key';
    const match = createMatcher({ $index, $key });
    assert(!match(['$index'], [-1]));
  });

  it('should not match $index to a string', () => {
    const $index = '$index';
    const $key = '$key';
    const match = createMatcher({ $index, $key });
    assert(!match(['$index'], ['foo']));
  });

  it('should match $index to a numeric string', () => {
    const $index = '$index';
    const $key = '$key';
    const match = createMatcher({ $index, $key });
    assert(match(['$index'], ['1']));
  });

  it('should match alternate $index name to an integer', () => {
    const $index = '$foo';
    const $key = '$key';
    const match = createMatcher({ $index, $key });
    assert(match(['$foo'], [1]));
  });

  it('should match $key to 0', () => {
    const $index = '$index';
    const $key = '$key';
    const match = createMatcher({ $index, $key });
    assert(match(['$key'], [0]));
  });

  it('should match $key to a number', () => {
    const $index = '$index';
    const $key = '$key';
    const match = createMatcher({ $index, $key });
    assert(match(['$key'], [3]));
  });

  it('should match $key to false', () => {
    const $index = '$index';
    const $key = '$key';
    const match = createMatcher({ $index, $key });
    assert(match(['$key'], [false]));
  });

  it('should match $key to a string', () => {
    const $index = '$index';
    const $key = '$key';
    const match = createMatcher({ $index, $key });
    assert(match(['$key'], ['foo']));
  });

  it('should match alternate $key name to a string', () => {
    const $index = '$index';
    const $key = '$foo';
    const match = createMatcher({ $index, $key });
    assert(match(['$foo','$foo'], ['foo','bar']));
  });

  it('should match literal indices', () => {
    const $index = '$index';
    const $key = '$key';
    const match = createMatcher({ $index, $key });
    assert(match(['foo', 1], ['foo', 1]));
  });
});
