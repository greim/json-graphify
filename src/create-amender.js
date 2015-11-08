/*
 * Copyright (c) 2015 by Greg Reimer <gregreimer@gmail.com>
 * MIT License. See mit-license.txt for more info.
 */

export default function(pattern) {
  return (path, id) => {
    path.splice(0, pattern.from.length);
    path.unshift.apply(path, pattern.to);
    for (let i=0; i<pattern.to.length; i++) {
      if (path[i] === '$id') {
        path[i] = id;
      }
    }
  };
}
