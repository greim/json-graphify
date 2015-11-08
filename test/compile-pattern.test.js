/*
 * Copyright (c) 2015 by Greg Reimer <gregreimer@gmail.com>
 * MIT License. See mit-license.txt for more info.
 */

/* eslint-env mocha */

import assert from 'assert';
import compilePattern from '../src/compile-pattern';

describe('compile-pattern', () => {

  it('should compile a pattern', () => {
    const pattern = compilePattern({ from: ['foo','bar','baz'], to: ['x','y','z'] });
    assert(typeof pattern.amend === 'function');
    assert(typeof pattern.if === 'function');
    assert.strictEqual(pattern.idProp, 'id');
    assert.deepEqual(pattern.from, ['foo','bar','baz']);
    assert.deepEqual(pattern.to, ['x','y','z']);
  });

  it('should compile a pattern with an alternate id prop', () => {
    const pattern = compilePattern({ from: ['foo','bar','baz'], to: ['x','y','z'], idProp: 'xxx' });
    assert(typeof pattern.amend === 'function');
    assert(typeof pattern.if === 'function');
    assert.strictEqual(pattern.idProp, 'xxx');
    assert.deepEqual(pattern.from, ['foo','bar','baz']);
    assert.deepEqual(pattern.to, ['x','y','z']);
  });

  it('should create an amender', () => {
    const pattern = compilePattern({ from: ['foo','bar','baz'], to: ['x','$id'], idProp: 'xxx' });
    const path = ['foo','bar','baz','qux'];
    pattern.amend(path, 'xxx');
    assert.deepEqual(path, ['x','xxx','qux']);
  });
});
