/*
 * Copyright (c) 2015 by Greg Reimer <gregreimer@gmail.com>
 * MIT License. See mit-license.txt for more info.
 */

/*
const extractor = new Extractor([{
  path: [ 'users', '$key', 'avatar' ],
  handler: avatar => $ref([ 'media', avatar.id ])
}]);
const pool = extractor.pool();
pool.insert('users', users);
pool.extract(path);
*/

import PatternMap from './pattern-map';
import { get, set } from './obj';

const privates = new WeakMap();

// ----------------------------

class Pool {

  constructor(map) {
    const graph = Object.create(null);
    const _ = { map, graph };
    privates.set(this, _);
  }

  insert(path, item) {
    const { graph } = privates.get(this);
    set(graph, path, item);
  }

  extract(path) {
    const { graph, map } = privates.get(this);
    const value = get(graph, path);
    const handler = map.get(path) || ident;
    return handler(value);
  }
}

// ----------------------------

export default class Extractor {

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

function ident(thing) {
  return thing;
}
