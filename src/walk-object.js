/*
 * Copyright (c) 2015 by Greg Reimer <gregreimer@gmail.com>
 * MIT License. See mit-license.txt for more info.
 */

 import $ref from './ref';

/*
 * Recursively iterate through every node in a JSON object tree.
 */

export default function* walkObj(value, parents, path, parent, key) {
  parents = parents || [];
  path = path || [];
  let isLeaf = isLeafNode(value);
  yield { parents, path, value, isLeaf };
  // in case there was a mutation over the yield
  value = parent !== undefined ? parent[key] : value;
  isLeaf = isLeafNode(value);
  if (!isLeaf) {
    parents.push(value);
    for (const { key, child } of iterate(value)) {
      path.push(key);
      const isLeaf = isLeafNode(child);
      yield* walkObj(value[key], parents, path, value, key);
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
      const child = thing[key];
      yield { key, child };
    }
  } else {
    for (const key in thing) {
      if (!thing.hasOwnProperty(key)) { continue; }
      const child = thing[key];
      yield { key, child };
    }
  }
}
