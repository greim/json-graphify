/*
 * Copyright (c) 2015 by Greg Reimer <gregreimer@gmail.com>
 * MIT License. See mit-license.txt for more info.
 */

/* eslint-env mocha */

import assert from 'assert';
import Extractor from '../src/extractor';

describe('extractor', () => {

  it('should construct', () => {

    new Extractor([{
      path: ['123'],
      handler: foo => foo
    }]);
  });

  it('should make a pool', () => {

    const extractor = new Extractor([{
      path: ['123'],
      handler: foo => foo
    }]);
    const pool = extractor.start();
    assert(!!pool);
  });

  it('pool should insert', () => {

    const extractor = new Extractor([{
      path: ['123'],
      handler: foo => foo
    }]);
    const pool = extractor.start();
    pool.insert(['foo','123'], { id: '123' });
  });

  it('pool should extract', () => {

    const extractor = new Extractor([{
      path: ['foo','bar'],
      handler: bar => bar
    }]);
    const pool = extractor.start();
    pool.insert(['foo','123'], { id: '123' });
    const val = pool.extract(['foo','123','id']);
    assert.strictEqual(val, '123');
  });

  it('pool should handle a keyed value', () => {

    const extractor = new Extractor([{
      path: ['user','$key','bar'],
      handler: bar => bar * bar
    }]);
    const pool = extractor.start();
    pool.insert(['user','123'], { bar: 8 });
    const val = pool.extract(['user','123','bar']);
    assert.strictEqual(val, 64);
  });
});
