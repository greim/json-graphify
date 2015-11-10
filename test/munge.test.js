/*
 * Copyright (c) 2015 by Greg Reimer <gregreimer@gmail.com>
 * MIT License. See mit-license.txt for more info.
 */

/* eslint-env mocha */

import assert from 'assert';
import munge from '../src/munge';

describe('munge', () => {

  it('should mutate top-level items of an array', () => {
    const obj = ['a','b','c'];
    munge(obj, [{ select: ['$index'], edit: val => val.toUpperCase() }]);
    assert.deepEqual(obj, ['A','B','C']);
  });

  it('should mutate top-level props of an object', () => {
    const obj = {a:'a',b:'b'};
    munge(obj, [{ select: ['$key'], edit: val => val.toUpperCase() }]);
    assert.deepEqual(obj, {a:'A',b:'B'});
  });

  it('should selectively mutate top-level props of an object', () => {
    const obj = {a:'a',b:'b'};
    munge(obj, [{ select: ['b'], edit: val => val.toUpperCase() }]);
    assert.deepEqual(obj, {a:'a',b:'B'});
  });

  it('should mutate second-level props of an object', () => {
    const obj = {a:'a',b:['b','c']};
    munge(obj, [{ select: ['b','$index'], edit: val => val.toUpperCase() }]);
    assert.deepEqual(obj, {a:'a',b:['B','C']});
  });

  it('should selectively mutate second-level props of an object', () => {
    const obj = {a:'a',b:['b','c']};
    munge(obj, [{ select: ['b',0], edit: val => val.toUpperCase() }]);
    assert.deepEqual(obj, {a:'a',b:['B','c']});
  });

  it('should delete props from an object', () => {
    const obj = {a:'a',b:{c:2}};
    munge(obj, [{ select: ['b','c'], edit: () => undefined }]);
    assert.deepEqual(obj, {a:'a',b:{}});
  });

  it('should not delete props from an array', () => {
    const obj = {a:'a',b:[1,2]};
    munge(obj, [{ select: ['b','$index'], edit: () => undefined }]);
    assert.deepEqual(obj, {a:'a',b:[undefined,undefined]});
  });

  it('should munge its own munges', () => {
    const obj = { a: 'a', b: null };
    munge(obj, [{
      select: ['b'],
      edit: () => ({ c: true })
    }, {
      select: ['b','c'],
      edit: val => !val
    }]);
    assert.deepEqual(obj, { a: 'a', b: { c: false } });
  });
});
