/*
 * Copyright (c) 2015 by Greg Reimer <gregreimer@gmail.com>
 * MIT License. See mit-license.txt for more info.
 */

/*
 * Recursively iterate through every node in a JSON object tree.
 */

export default function* walkObj(obj, parents, path) {
  parents = parents || [];
  path = path || [];
  if (typeof obj === 'object') {
    parents.push(obj);
    for (const key in obj) {
      if (!obj.hasOwnProperty(key)) { continue; }
      const child = obj[key];
      path.push(key);
      yield { parents, path, value: child };
      if (typeof child === 'object') {
        yield* walkObj(child, parents, path);
      }
      path.pop();
    }
    parents.pop();
  }
}

// just for testing
export function* expensiveWalkObject(...args) {
  for (const { parents, path, value } of walkObj(...args)) {
    yield {
      parents: parents.slice(),
      path: path.slice(),
      value
    };
  }
}
