/*
 * Copyright (c) 2015 by Greg Reimer <gregreimer@gmail.com>
 * MIT License. See mit-license.txt for more info.
 */

/*
const extractor = new Collector([{
  path: [ 'users', '$key', 'avatar' ],
  handler: avatar => $ref([ 'media', avatar.id ])
}]);
const pool = extractor.pool();
pool.insert('users', users);
pool.extract(path);
*/

import PatternMap from './pattern-map';

const privates = new WeakMap();

// ----------------------------

class Pool {

  constructor(map) {
    const graph = Object.create(null);
    const _ = { map, graph };
    privates.set(this, _);
  }

  insert(name, things) {
    const { graph } = privates.get(this);
    for (const thing of things) {
      if (!graph[name]) {
        graph[name] = Object.create(null);
      }
      if (thing.id === undefined) {
        throw new Error('missing id');
      }
      graph[name][thing.id] = thing;
    }
  }

  extract(path) {
    const { graph, map } = privates.get(this);
    const value = get(graph, path);
    const handler = map.get(path) || ident;
    return handler(value);
  }
}

// ----------------------------

export default class Collector {

  constructor(pathHandlers) {
    const map = new PatternMap();
    const _ = { map };
    privates.set(this, _);
    for (const ph of pathHandlers) {
      map.set(ph.path, ph.handler);
    }
  }

  start() {
    const { map } = privates.get(this);
    return new Pool(map);
  }
}

// ----------------------------

function get(obj, path, idx = 0) {
  const len = path.length - idx;
  if (len === 0) {
    return obj;
  } else if (obj === null || obj === undefined) {
    return obj;
  } else {
    const step = path[idx];
    const child = obj[step];
    return get(child, path, idx + 1);
  }
}

function ident(thing) {
  return thing;
}
