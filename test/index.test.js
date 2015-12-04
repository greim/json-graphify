/*
 * Copyright (c) 2015 by Greg Reimer <gregreimer@gmail.com>
 * MIT License. See mit-license.txt for more info.
 */

/* eslint-env mocha */

import assert from 'assert';
import graphify, { extractor } from '../src';
import Converter from '../src/converter';
import Extractor from '../src/extractor';

describe('index', () => {

  it('default export should be a function', () => {

    assert.strictEqual(typeof graphify, 'function');
  });

  it('default export should return a converter', () => {

    const converter = graphify({});
    assert(converter instanceof Converter);
  });

  it('"extractor" export should be a function', () => {

    assert.strictEqual(typeof extractor, 'function');
  });

  it('"extractor" export should return an extractor', () => {

    const ex = extractor([]);
    assert(ex instanceof Extractor);
  });
});
