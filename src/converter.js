/*
 * Copyright (c) 2015 by Greg Reimer <gregreimer@gmail.com>
 * MIT License. See mit-license.txt for more info.
 */

import walkObject from './walk-object';
import createMatcher from './create-matcher';
import findPattern from './find-pattern';
import compilePattern from './compile-pattern';
import $ref from './ref';

export default class {

  constructor(opts) {
    opts = Object.assign({
      $index: '$index',
      $key: '$key',
      idProp: 'id'
    }, opts);
    opts.patterns = opts.patterns.map(compilePattern);
    opts.match = createMatcher(opts);
    this._opts = Object.freeze(opts);
  }

  toPathValues(obj) {

    // this will be returned
    const result = [];

    // prepend this to every non-amended path
    const prepend = [ this._opts.name, obj[this._opts.idProp] ];

    // walk the object tree
    for (const { parents, path: rawPath, value } of walkObject(obj)) {

      const isLeaf = typeof value !== 'object' || value === null;

      // if pattern exists, there was a match
      const pattern = findPattern(
        this._opts.match,
        this._opts.patterns,
        rawPath
      );

      if (pattern) {

        // this is how we know what id to use
        const idBearer = parents[pattern.from.length] || value;
        const id = idBearer[pattern.idProp];

        if (id !== undefined) {

          if (pattern.from.length === rawPath.length) {

            // if lengths match, `value` is the root of a subtree
            // which is being amended to the top of the graph
            // and a $ref left in its place
            const pathA = prepend.concat(rawPath);
            const pathB = rawPath.slice();
            pattern.amend(pathB, id);
            result.push({ path: pathA, value: $ref(pathB) });
          }

          if (isLeaf) {

            // if value is a leaf node, generate an amended result
            const path = rawPath.slice();
            pattern.amend(path, id);
            result.push({ path, value });

          } else if (Array.isArray(value)) {

            // for sub-arrays, generate an amended length result
            const path = rawPath.slice();
            path.push('length');
            pattern.amend(path, id);
            result.push({ path, value: value.length });
          }
        }
      } else if (isLeaf) {

        // if value is a leaf, generate a result
        const path = prepend.concat(rawPath);
        result.push({ path, value });

      } else if (Array.isArray(value)) {

        // for sub-arrays, generate a length result
        const path = prepend.concat(rawPath);
        path.push('length');
        result.push({ path, value: value.length });
      }
    }

    // fin
    return result;
  }

  toGraph(obj) {
    const paths = this.toPathValues(obj);
    const jsong = graphify(paths);
    return jsong;
  }
}

function graphify(paths) {
  const jsong = {};
  for (const { path, value } of paths) {
    set(jsong, path, value);
  }
  return jsong;
}

function set(obj, path, value, idx, parent, prevStep) {
  idx = idx || 0;
  const step = path[idx];
  if (!obj) {
    obj = {};
    parent && (parent[prevStep] = obj);
  }
  if (idx === path.length - 1) {
    obj[step] = value;
  } else {
    return set(obj[step], path, value, idx + 1, obj, step);
  }
}