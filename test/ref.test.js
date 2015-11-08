/*
 * Copyright (c) 2015 by Greg Reimer <gregreimer@gmail.com>
 * MIT License. See mit-license.txt for more info.
 */

/* eslint-env mocha */

import assert from 'assert';
import $ref from '../src/ref';

describe('ref', () => {
  it('should return a valid ref', () => {
    const $type = 'ref';
    const value = [ 'foo', 'bar' ];
    assert.deepEqual($ref(['foo','bar']), { $type, value });
  });
});
