/*
 * Copyright (c) 2015 by Greg Reimer <gregreimer@gmail.com>
 * MIT License. See mit-license.txt for more info.
 */

/* eslint-env mocha */

import assert from 'assert';
import graphify from '../src/index';
import $ref from '../src/ref';

describe('index', () => {

  const convert = graphify({
    name: 'users',
    move: [
      { from: ['followers','$index'], to: ['users','$id'] },
      { from: ['logo'], to: ['media','$id'] }
    ]
  });

  it('should convert', () => {

    const converted = convert.toPathValues({
      id: '1',
      username: 'foo'
    });

    assert.deepEqual([...converted], [
      { path: ['users', '1', 'id'], value: '1' },
      { path: ['users', '1', 'username'], value: 'foo' }
    ]);
  });

  it('should convert more than one thing', () => {

    const converted = convert.toPathValues({
      id: '1',
      username: 'foo'
    }, {
      id: '2',
      username: 'bar'
    });

    assert.deepEqual([...converted], [
      { path: ['users', '1', 'id'], value: '1' },
      { path: ['users', '1', 'username'], value: 'foo' },
      { path: ['users', '2', 'id'], value: '2' },
      { path: ['users', '2', 'username'], value: 'bar' }
    ]);
  });

  it('should convert with a ref', () => {

    const converted = convert.toPathValues({
      id: '1',
      username: 'foo',
      email: 'foo@example.com',
      logo: { id: '2', src: 'http://example.com/logo.jpg' }
    });

    assert.deepEqual([...converted], [
      { path: ['users', '1', 'id'], value: '1' },
      { path: ['users', '1', 'username'], value: 'foo' },
      { path: ['users', '1', 'email'], value: 'foo@example.com' },
      { path: ['users', '1', 'logo'], value: { $type: 'ref', value: [ 'media', '2' ] } },
      { path: ['media', '2', 'id'], value: '2' },
      { path: ['media', '2', 'src'], value: 'http://example.com/logo.jpg' }
    ]);
  });

  it('should convert with an array of refs', () => {

    const converted = convert.toPathValues({
      id: '1',
      username: 'foo',
      followers: [
        { id: '2', username: 'bar' },
        { id: '3', username: 'baz' }
      ]
    });

    assert.deepEqual([...converted], [
      { path: ['users', '1', 'id'], value: '1' },
      { path: ['users', '1', 'username'], value: 'foo' },
      { path: ['users', '1', 'followers', 'length'], value: 2 },
      { path: ['users', '1', 'followers', 0], value: { $type: 'ref', value: ['users', '2'] } },
      { path: ['users', '2', 'id' ], value: '2' },
      { path: ['users', '2', 'username' ], value: 'bar' },
      { path: ['users', '1', 'followers', 1], value: { $type: 'ref', value: ['users', '3'] } },
      { path: ['users', '3', 'id' ], value: '3' },
      { path: ['users', '3', 'username' ], value: 'baz' }
    ]);
  });

  it('should add a length to an amended path', () => {

    const converted = convert.toPathValues({
      id: '1',
      username: 'foo',
      followers: [
        { id: '3', username: 'baz', foo: [] }
      ]
    });

    assert.deepEqual([...converted], [
      { path: ['users', '1', 'id'], value: '1' },
      { path: ['users', '1', 'username'], value: 'foo' },
      { path: ['users', '1', 'followers', 'length'], value: 1 },
      { path: ['users', '1', 'followers', 0], value: { $type: 'ref', value: ['users', '3'] } },
      { path: ['users', '3', 'id' ], value: '3' },
      { path: ['users', '3', 'username' ], value: 'baz' },
      { path: ['users', '3', 'foo', 'length' ], value: 0 }
    ]);
  });

  it('should not fail on null', () => {

    const converted = convert.toPathValues({
      id: '1',
      username: 'foo',
      followers: [
        null
      ]
    });

    assert.deepEqual([...converted], [
      { path: ['users', '1', 'id'], value: '1' },
      { path: ['users', '1', 'username'], value: 'foo' },
      { path: ['users', '1', 'followers', 'length'], value: 1 },
      { path: ['users', '1', 'followers', 0], value: { $type: 'atom', value: null } }
    ]);
  });

  it('should not convert if id missing', () => {

    const converted = convert.toPathValues({
      id: '1',
      username: 'foo',
      followers: [ '2' ]
    });

    //console.log(JSON.stringify(converted));

    assert.deepEqual([...converted], [
      { path: ['users', '1', 'id'], value: '1' },
      { path: ['users', '1', 'username'], value: 'foo' },
      { path: ['users', '1', 'followers', 'length'], value: 1 },
      { path: ['users', '1', 'followers', 0], value: { $type: 'atom', value: 2 } }
    ]);
  });

  it('should atomize objects missing ids', () => {

    // this is likely an error condition on the part
    // of the user but we need to do something
    // minimally destructive

    const converted = convert.toPathValues({
      id: '1',
      username: 'foo',
      logo: { yes: 'foo' }
    });

    //console.log(JSON.stringify(converted));

    assert.deepEqual([...converted], [
      { path: ['users', '1', 'id'], value: '1' },
      { path: ['users', '1', 'username'], value: 'foo' },
      { path: ['users', '1', 'logo'], value: { $type: 'atom', value: { yes: 'foo' } } }
    ]);
  });

  it('should convert using literal indices', () => {

    const converted = graphify({
      name: 'users',
      move: [
        { from: ['followers', 0], to: ['users','$id'] }
      ]
    }).toGraph({
      id: '1',
      username: 'foo',
      followers: [
        { id: '2', username: 'bar' },
        { id: '3', username: 'baz' }
      ]
    });

    //console.log(JSON.stringify(converted, null, 3));

    assert.deepEqual(converted, {
      users: {
        '1': {
          id: '1',
          username: 'foo',
          followers: {
            0: { $type: 'ref', value: [ 'users', '2' ] },
            1: { id: '3', username: 'baz' },
            length: 2
          }
        },
        '2': {
          id: '2',
          username: 'bar'
        }
      }
    });
  });

  it('should convert to JSON graph', () => {

    const converted = convert.toGraph({
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
          followers: {
            0: { $type: 'ref', value: [ 'users', '2' ] },
            1: { $type: 'ref', value: [ 'users', '3' ] },
            length: 2
          },
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

  it('should convert more than one thing to JSON graph', () => {

    const converted = convert.toGraph({
      id: '1',
      username: 'foo'
    }, {
      id: '2',
      username: 'bar'
    });

    assert.deepEqual(converted, {
      users: {
        1: {
          id: '1',
          username: 'foo'
        },
        2: {
          id: '2',
          username: 'bar'
        }
      }
    });
  });

  it('should convert to path map', () => {

    const converted = convert.toPathMap({
      id: '1',
      username: 'foo',
      followers: [{
        id: '2',
        username: 'bar'
      }]
    });

    const expected = [
      { path: [ 'users', '1', 'id' ], value: '1' },
      { path: [ 'users', '1', 'username' ], value: 'foo' },
      { path: [ 'users', '1', 'followers', 'length' ], value: 1 },
      { path: [ 'users', '1', 'followers', 0 ], value: { $type: 'ref', value: [ 'users', '2' ] } },
      { path: [ 'users', '2', 'id' ], value: '2' },
      { path: [ 'users', '2', 'username' ], value: 'bar' }
    ];

    for (const { path, value } of expected) {
      assert(converted.has(path), `did not contain ${JSON.stringify(path)}`);
      assert.deepEqual(converted.get(path), value);
    }

    assert.strictEqual(converted.size, expected.length);
  });

  it('should convert more than one thing to path map', () => {

    const converted = convert.toPathMap({
      id: '1',
      username: 'foo'
    }, {
      id: '2',
      username: 'bar'
    });

    const expected = [
      { path: [ 'users', '1', 'id' ], value: '1' },
      { path: [ 'users', '1', 'username' ], value: 'foo' },
      { path: [ 'users', '2', 'id' ], value: '2' },
      { path: [ 'users', '2', 'username' ], value: 'bar' }
    ];

    for (const { path, value } of expected) {
      assert(converted.has(path), `did not contain ${JSON.stringify(path)}`);
      assert.deepEqual(converted.get(path), value);
    }

    assert.strictEqual(converted.size, expected.length);
  });

  it('should munge', () => {

    const converted = graphify({
      name: 'users',
      munge: [{ select: [ 'nemesis' ], edit: id => $ref([ 'users', id ]) }]
    }).toGraph({
      id: '1',
      nemesis: '2'
    });

    assert.deepEqual(converted, {
      users: {
        '1': {
          id: '1',
          nemesis: $ref([ 'users', 2 ])
        }
      }
    });
  });
});
