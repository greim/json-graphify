/*
 * Copyright (c) 2015 by Greg Reimer <gregreimer@gmail.com>
 * MIT License. See mit-license.txt for more info.
 */

export default function(move) {
  return (path, id) => {
    path.splice(0, move.from.length);
    path.unshift.apply(path, move.to);
    for (let i=0; i<move.to.length; i++) {
      if (path[i] === '$id') {
        path[i] = id;
      }
    }
  };
}
