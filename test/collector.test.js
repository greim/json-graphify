/*
 * Copyright (c) 2015 by Greg Reimer <gregreimer@gmail.com>
 * MIT License. See mit-license.txt for more info.
 */

/* eslint-env mocha */

import assert from 'assert';
import Collector from '../src/collector';

describe('collector', () => {

  it('should construct', () => {

    new Collector([{
      path: ['123'],
      handler: foo => foo
    }]);
  });

  it('should make a pool', () => {

    const collector = new Collector([{
      path: ['123'],
      handler: foo => foo
    }]);
    const pool = collector.start();
    assert(!!pool);
  });

  it('pool should insert', () => {

    const collector = new Collector([{
      path: ['123'],
      handler: foo => foo
    }]);
    const pool = collector.start();
    pool.insert('foo', [{ id: '123' }]);
  });

  it('pool should extract', () => {

    const collector = new Collector([{
      path: ['foo','bar'],
      handler: bar => bar
    }]);
    const pool = collector.start();
    pool.insert('foo', [{ id: '123' }]);
    const val = pool.extract(['foo','123','id']);
    assert.strictEqual(val, '123');
  });

  it('pool should handle a keyed value', () => {

    const collector = new Collector([{
      path: ['user','$key','bar'],
      handler: bar => bar * bar
    }]);
    const pool = collector.start();
    pool.insert('user', [{ id: '123', bar: 8 }]);
    const val = pool.extract(['user','123','bar']);
    assert.strictEqual(val, 64);
  });
});
