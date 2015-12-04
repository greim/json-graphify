/*
 * Copyright (c) 2015 by Greg Reimer <gregreimer@gmail.com>
 * MIT License. See mit-license.txt for more info.
 */

export function get(obj, path, idx = 0) {
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

export function set(obj, path, value, parents = []) {
  const len = path.length - parents.length;
  if (len === 0) {
    const parent = parents[parents.length - 1];
    const prop = path[parents.length - 1];
    parent[prop] = value;
  } else {
    const step = path[parents.length];
    if (obj === null || obj === undefined) {
      const parent = parents[parents.length - 1];
      const prop = path[parents.length - 1];
      obj = parent[prop] = Number.isInteger(step) ? [] : {};
    } else if (typeof obj !== 'object') {
      throw new TypeError('Type mismatch');
    }
    parents.push(obj);
    const child = obj[step];
    return set(child, path, value, parents);
  }
}
