/*
 * Copyright (c) 2015 by Greg Reimer <gregreimer@gmail.com>
 * MIT License. See mit-license.txt for more info.
 */

export default function* iteratePathSet(pathSet, pointer = 0, path = []) {
  if (pointer >= pathSet.length) {
    yield path.slice();
  } else {
    const thing = pathSet[pointer];
    for (const x of iterateThing(thing)) {
      path.push(x);
      yield* iteratePathSet(pathSet, pointer + 1, path);
      path.pop();
    }
  }
}

function* iterateThing(thing) {
  const isArray = Array.isArray(thing);
  if (isArray && thing.length > 0 && typeof thing[0].from === 'number') {
    for (const { from, to } of thing) {
      for (let i=from; i<=to; i++) {
        yield i;
      }
    }
  } else if (typeof thing.from === 'number') {
    const { from, to } = thing;
    for (let i=from; i<=to; i++) {
      yield i;
    }
  } else if (isArray) {
    for (let item of thing) {
      yield item;
    }
  } else {
    yield thing;
  }
}
