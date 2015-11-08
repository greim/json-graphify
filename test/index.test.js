/*
 * Copyright (c) 2015 by Greg Reimer <gregreimer@gmail.com>
 * MIT License. See mit-license.txt for more info.
 */

/* eslint-env mocha */

import assert from 'assert';
import jsonConverter from '../src/index';

describe('index', () => {

  const converter = jsonConverter({
    name: 'users',
    patterns: [
      { from: ['followers','$index'], to: ['users','$id'] },
      { from: ['logo'], to: ['media','$id'] }
    ]
  });

  it('should convert with no refs', () => {

    const converted = converter({
      id: '1',
      username: 'foo'
    });

    assert.deepEqual(converted, [
      { path: ['users', '1', 'id'], value: '1' },
      { path: ['users', '1', 'username'], value: 'foo' }
    ]);
  });

  it('should convert with a ref', () => {

    const converted = converter({
      id: '1',
      username: 'foo',
      email: 'foo@example.com',
      logo: { id: '2', src: 'http://example.com/logo.jpg' }
    });

    assert.deepEqual(converted, [
      { path: ['users', '1', 'id'], value: '1' },
      { path: ['users', '1', 'username'], value: 'foo' },
      { path: ['users', '1', 'email'], value: 'foo@example.com' },
      { path: ['users', '1', 'logo'], value: { $type: 'ref', value: [ 'media', '2' ] } },
      { path: ['media', '2', 'id'], value: '2' },
      { path: ['media', '2', 'src'], value: 'http://example.com/logo.jpg' }
    ]);
  });

  it('should convert with an array of refs', () => {

    const converted = converter({
      id: '1',
      username: 'foo',
      followers: [
        { id: '2', username: 'bar' },
        { id: '3', username: 'baz' }
      ]
    });

    assert.deepEqual(converted, [
      { path: ['users', '1', 'id'], value: '1' },
      { path: ['users', '1', 'username'], value: 'foo' },
      { path: ['users', '1', 'followers', 0], value: { $type: 'ref', value: ['users', '2'] } },
      { path: ['users', '2', 'id' ], value: '2' },
      { path: ['users', '2', 'username' ], value: 'bar' },
      { path: ['users', '1', 'followers', 1], value: { $type: 'ref', value: ['users', '3'] } },
      { path: ['users', '3', 'id' ], value: '3' },
      { path: ['users', '3', 'username' ], value: 'baz' }
    ]);
  });

  it('should not convert if id missing', () => {

    const converted = converter({
      id: '1',
      username: 'foo',
      followers: [ '2' ]
    });

    //console.log(JSON.stringify(converted));

    assert.deepEqual(converted, [
      { path: ['users', '1', 'id'], value: '1' },
      { path: ['users', '1', 'username'], value: 'foo' },
    ]);
  });

  it('should convert to JSON graph', () => {

    const converted = converter.toGraph({
      id: '1',
      username: 'foo',
      followers: [{
        id: '2',
        username: 'bar'
      },{
        id: '3',
        username: 'baz'
      }],
      logo: {
        id: '4',
        src: 'http://media.example.com/123.jpg'
      }
    });

    assert.deepEqual(converted, {
      users: {
        1: {
          id: '1',
          username: 'foo',
          followers: [
            { $type: 'ref', value: [ 'users', '2' ] },
            { $type: 'ref', value: [ 'users', '3' ] }
          ],
          logo: { $type: 'ref', value: [ 'media', '4' ] }
        },
        2: {
          id: '2',
          username: 'bar'
        },
        3: {
          id: '3',
          username: 'baz'
        }
      },
      media: {
        '4': {
          id: '4',
          src: 'http://media.example.com/123.jpg'
        }
      }
    });
  });
});
