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
import PathMap from 'pmap';

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

  *toPathValues(...objs) {

    for (const obj of objs) {
      munge(obj, this._opts.munge);
      const prepend = [ this._opts.name, obj[this._opts.idAttribute] ];

      for (let { parents, path, value, isLeaf } of walkObject(obj)) {
        if (parents.length === 0) { continue; }
        const move = findMove(this._opts.move, path);
        let amended = false;
        if (move) {
          const isSubroot = move.from.length === path.length;
          const idBearer = parents[move.from.length] || value;
          const id = idBearer ? idBearer[move.idAttribute] : undefined;
          if (id !== undefined) {
            const origPath = path;
            path = path.slice();
            move.amend(path, id);
            amended = true;
            if (isSubroot) {
              yield { path: prepend.concat(origPath), value: $ref(path) };
            }
          } else {
            value = { $type: 'atom', value };
            const parent = parents[parents.length - 1];
            const prop = path[path.length - 1];
            parent[prop] = value;
            isLeaf = true;
          }
        }
        if (!amended) {
          path = prepend.concat(path);
        }
        if (isLeaf) {
          yield { path, value };
        } else if (Array.isArray(value)) {
          path.push('length');
          yield { path, value: value.length };
        }
      }
    }
  }

  toGraph(...objs) {
    const paths = this.toPathValues(...objs);
    const jsong = graphify(paths);
    return jsong;
  }

  toPathMap(...objs) {
    const pathVals = this.toPathValues(...objs);
    const pathMap = new PathMap();
    for (const { path, value } of pathVals) {
      pathMap.set(path, value);
    }
    return pathMap;
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
