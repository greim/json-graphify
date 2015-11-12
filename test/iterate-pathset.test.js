/*
 * Copyright (c) 2015 by Greg Reimer <gregreimer@gmail.com>
 * MIT License. See mit-license.txt for more info.
 */

import iteratePathset from '../src/iterate-pathset';
import assert from 'assert';

describe.only('iterate-pathset', () => {

  it('iterate nothing', () => {
    const pathSet = [];
    const all = [...iteratePathset(pathSet)];
    assert.deepEqual(all, [[]]);
  });

  it('iterate one thing', () => {
    const pathSet = ['a'];
    const all = [...iteratePathset(pathSet)];
    assert.deepEqual(all, [['a']]);
  });

  it('iterate two thing', () => {
    const pathSet = ['a',2];
    const all = [...iteratePathset(pathSet)];
    assert.deepEqual(all, [['a',2]]);
  });

  it('iterate one range', () => {
    const pathSet = [{from:0,to:1}];
    const all = [...iteratePathset(pathSet)];
    assert.deepEqual(all, [[0],[1]]);
  });

  it('iterate one range set', () => {
    const pathSet = [[{from:0,to:1},{from:3,to:4}]];
    const all = [...iteratePathset(pathSet)];
    assert.deepEqual(all, [[0],[1],[3],[4]]);
  });

  it('iterate two range sets', () => {
    const pathSet = [[{from:0,to:1}],[{from:0,to:1}]];
    const all = [...iteratePathset(pathSet)];
    assert.deepEqual(all, [[0,0],[0,1],[1,0],[1,1]]);
  });

  it('iterate multiple arrays', () => {
    const pathSet = [[0,1],[0,1]];
    const all = [...iteratePathset(pathSet)];
    assert.deepEqual(all, [[0,0],[0,1],[1,0],[1,1]]);
  });

  it('iterate something else', () => {
    const pathSet = ['foo',[1,2,3],['bar','baz']];
    const all = [...iteratePathset(pathSet)];
    assert.deepEqual(all, [
      ['foo',1,'bar'],
      ['foo',1,'baz'],
      ['foo',2,'bar'],
      ['foo',2,'baz'],
      ['foo',3,'bar'],
      ['foo',3,'baz'],
    ]);
  });
});