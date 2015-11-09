/*
 * Copyright (c) 2015 by Greg Reimer <gregreimer@gmail.com>
 * MIT License. See mit-license.txt for more info.
 */

import walkObject from './walk-object';
import createMatcher from './create-matcher';
import findPattern from './find-pattern';
import compilePattern from './compile-pattern';
import $ref from './ref';

/*
var userConverter = new Converter({
  patterns: [ ... ],
  name: 'users',
  idProp: 'id',
  $index: '$index',
  $key: '$key'
})

var userConverter = new Converter([
  { from: ['user','champions','$index'], to: ['champions','$id'] }
])

userConverter.convert(userObj)
*/

export default class {

  constructor(opts) {

    opts = Object.assign({
      $index: '$index',
      $key: '$key',
      idProp: 'id'
    }, opts);
    this._opts = opts;

    opts.patterns = opts.patterns.map(compilePattern);

    opts.match = createMatcher(opts);
  }

  convert(obj) {
    const result = [];
    const prepend = [ this._opts.name, obj[this._opts.idProp] ];
    for (const { parents, path: rawPath, value } of walkObject(obj)) {

      const pattern = findPattern(
        this._opts.match,
        this._opts.patterns,
        rawPath
      );

      const isLeaf = typeof value !== 'object';

      if (pattern) {

        const parentWithId = parents[pattern.from.length] || value;
        const id = parentWithId[pattern.idProp];

        if (pattern.if(parentWithId)) {

          if (pattern.from.length === rawPath.length) {
            const pathA = prepend.concat(rawPath);
            const pathB = rawPath.slice();
            pattern.amend(pathB, id);
            result.push({ path: pathA, value: $ref(pathB) });
          }

          if (isLeaf) {

            const path = rawPath.slice();
            pattern.amend(path, id);
            result.push({ path, value });

          } else if (Array.isArray(value)) {

            const path = rawPath.slice();
            path.push('length');
            pattern.amend(path, id);
            result.push({ path, value: value.length });
          }
        }

      } else if (isLeaf) {

        const path = prepend.concat(rawPath);
        result.push({ path, value });

      } else if (Array.isArray(value)) {

        const path = prepend.concat(rawPath);
        path.push('length');
        result.push({ path, value: value.length });
      }
    }
    return result;
  }

  toGraph(obj) {
    const paths = this.convert(obj);
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