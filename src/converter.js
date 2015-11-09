/*
 * Copyright (c) 2015 by Greg Reimer <gregreimer@gmail.com>
 * MIT License. See mit-license.txt for more info.
 */

import walkObject from './walk-object';
import $ref from './ref';
import deepFreeze from 'deep-freeze';
import munge from './munge';
import createAmender from './create-amender';
import match from './match-paths';

export default class {

  constructor(opts) {

    opts = Object.assign({
      idAttribute: 'id',
      move: [],
      munge: []
    }, opts);

    opts.move = opts.move.map(compileMove);

    this._opts = deepFreeze(opts);
  }

  toPathValues(obj) {

    munge(obj, this._opts.munge);

    // this will be returned
    const result = [];

    // prepend this to every non-amended path
    const prepend = [ this._opts.name, obj[this._opts.idAttribute] ];

    // walk the object tree
    for (let { parents, path: rawPath, value, isLeaf } of walkObject(obj)) {

      // if a move exists, there was a match
      const move = findMove(
        this._opts.move,
        rawPath
      );

      if (move) {

        // if lengths match, `value` is the root of a subtree
        // which is being amended.
        const isSubroot = move.from.length === rawPath.length;

        // this is how we know what id to use
        const idBearer = parents[move.from.length] || value;
        const id = idBearer[move.idAttribute];

        if (id !== undefined) {

          if (isSubroot) {

            // this subroot is being moved, and a $ref left in its wake
            const pathA = prepend.concat(rawPath);
            const pathB = rawPath.slice();
            move.amend(pathB, id);
            result.push({ path: pathA, value: $ref(pathB) });
          }

          if (isLeaf) {

            // if value is a leaf node, generate an amended result
            const path = rawPath.slice();
            move.amend(path, id);
            result.push({ path, value });

          } else if (Array.isArray(value)) {

            // for sub-arrays, generate an amended length result
            const path = rawPath.slice();
            path.push('length');
            move.amend(path, id);
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

function findMove(moves, path) {
  for (let move of moves) {
    if (match(move.from, path)) {
      return move;
    }
  }
}

function compileMove(move) {
  const result = Object.assign({ idAttribute: 'id' }, move);
  if (result.to) {
    result.amend = createAmender(result);
  }
  return result;
}
