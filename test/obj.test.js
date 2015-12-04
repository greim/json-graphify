/*
 * Copyright (c) 2015 by Greg Reimer <gregreimer@gmail.com>
 * MIT License. See mit-license.txt for more info.
 */

/* eslint-env mocha */

import assert from 'assert';
import { set, get } from '../src/obj';

describe('obj', () => {

  describe('get', () => {

    it('should get zero levels deep', () => {
      const o = {};
      const result = get(o, []);
      assert.strictEqual(result, o);
    });

    it('should get one level deep', () => {
      const result = get({foo:0}, ['foo']);
      assert.strictEqual(result, 0);
    });

    it('should get two levels deep', () => {
      const result = get({foo:{bar:1}}, ['foo','bar']);
      assert.strictEqual(result, 1);
    });

    it('should not get one level deep', () => {
      const result = get({}, ['foo']);
      assert.strictEqual(result, undefined);
    });

    it('should not get two levels deep', () => {
      const result = get({foo:{}}, ['foo','bar']);
      assert.strictEqual(result, undefined);
    });
  });

  describe('set', () => {

    it('should set one level deep', () => {
      const o = {};
      set(o, ['foo'], 8);
      assert.strictEqual(o.foo, 8);
    });

    it('should set two levels deep', () => {
      const o = {};
      set(o, ['foo','bar'], 8);
      assert.strictEqual(o.foo.bar, 8);
    });

    it('should set two levels deep creating array', () => {
      const o = {};
      set(o, ['foo',0], 8);
      assert.strictEqual(o.foo[0], 8);
    });

    it('should create an object', () => {
      const o = {};
      set(o, ['foo','bar'], 8);
      assert(!Array.isArray(o.foo));
    });

    it('should create an array', () => {
      const o = {};
      set(o, ['foo', 0], 8);
      assert(Array.isArray(o.foo));
    });

    it('should refuse to branchify a primitive leaf', () => {
      const o = {foo:8};
      assert.throws(() => set(o, ['foo', 'baz'], 9), /type/i);
    });
  });
});
