/*
 * Copyright (c) 2015 by Greg Reimer <gregreimer@gmail.com>
 * MIT License. See mit-license.txt for more info.
 */

 import $ref from './ref';

/*
 * Recursively iterate through every node in a JSON object tree.
 */

export default function* walkObj(obj, parents, path) {
  parents = parents || [];
  path = path || [];
  if (!isLeafNode(obj)) {
    parents.push(obj);
    for (const { key, value } of iterate(obj)) {
      path.push(key);
      const isLeaf = isLeafNode(value);
      yield { parents, path, value, isLeaf };
      yield* walkObj(obj[key], parents, path);
      path.pop();
    }
    parents.pop();
  }
}

export const isLeafNode = (() => {
  const $jsongLeafTypes = new Set([ 'ref', 'atom', 'error' ]);
  const $branchTypes = new Set([ 'object' ]);
  return function(thing) {
    const isLeaf = !thing || !$branchTypes.has(typeof thing);
    const isJsongLeaf = !!thing && $jsongLeafTypes.has(thing.$type);
    return isLeaf || isJsongLeaf;
  };
})();


// just for testing
export function* expensiveWalkObject(...args) {
  for (const thing of walkObj(...args)) {
    thing.parents = thing.parents.slice();
    thing.path = thing.path.slice();
    yield thing;
  }
}

// object/array agnostic iterator
function* iterate(thing) {
  if (Array.isArray(thing)) {
    for (let key=0; key<thing.length; key++) {
      const value = thing[key];
      yield { key, value };
    }
  } else {
    for (const key in thing) {
      if (!thing.hasOwnProperty(key)) { continue; }
      const value = thing[key];
      yield { key, value };
    }
  }
}
