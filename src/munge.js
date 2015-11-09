/*
 * Copyright (c) 2015 by Greg Reimer <gregreimer@gmail.com>
 * MIT License. See mit-license.txt for more info.
 */

import walkObject from './walk-object';
import match from './match-paths';

export default function(obj, munges) {
  if (munges.length > 0) {
    for (let { parents, path, value } of walkObject(obj)) {
      for (let { select, edit } of munges) {
        if (match(select, path, true)) {
          const parent = parents[parents.length - 1];
          const prop = path[path.length - 1];
          const editedVal = edit(value, parent);
          if (editedVal === undefined && !Array.isArray(parent)) {
            delete parent[prop];
          } else {
            parent[prop] = editedVal;
          }
        }
      }
    }
  }
}
