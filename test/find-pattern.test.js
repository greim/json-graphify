/*
 * Copyright (c) 2015 by Greg Reimer <gregreimer@gmail.com>
 * MIT License. See mit-license.txt for more info.
 */

/* eslint-env mocha */

import assert from 'assert';
import findPattern from '../src/find-pattern';
import createMatcher from '../src/create-matcher';
import compilePattern from '../src/compile-pattern';

describe('find-pattern', () => {

  it('should find a pattern', () => {
    const $index = '$index';
    const $key = '$key';
    const match = createMatcher({ $index, $key });
    const patterns = [
      compilePattern({ from: ['foo','bar'], to: ['a','b'] }),
      compilePattern({ from: ['baz','qux'], to: ['a','b'] })
    ];
    const matched = findPattern(match, patterns, ['foo','bar','baz']);
    assert.deepEqual(matched.from, ['foo','bar']);
  });

  it('should not find a pattern', () => {
    const $index = '$index';
    const $key = '$key';
    const match = createMatcher({ $index, $key });
    const patterns = [
      compilePattern({ from: ['foo','bar'], to: ['a','b'] }),
      compilePattern({ from: ['baz','qux'], to: ['a','b'] })
    ];
    const matched = findPattern(match, patterns, ['x','y','z']);
    assert.strictEqual(matched, undefined);
  });
});
