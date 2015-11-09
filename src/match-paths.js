/*
 * Copyright (c) 2015 by Greg Reimer <gregreimer@gmail.com>
 * MIT License. See mit-license.txt for more info.
 */

/*
 * Determine whether a pattern array matches a target array.
 * Exact matches and exact positions are required for a match,
 * except the pattern may contain wildcards such as '$index' for
 * any positive integer and '$key' to match anything whatsoever.
 */

export default function(patt, targ, exactLength) {

  if (exactLength) {
    if (patt.length !== targ.length) {
      return false;
    }
  } else {
    if (patt.length > targ.length) {
      return false;
    }
  }

  for (let i=0; i<patt.length; i++) {
    const pattItem = patt[i];
    const targItem = targ[i];
    if (pattItem === '$index') {
      let num = targItem;
      if (typeof num !== 'number') {
        num = parseFloat(num, 10);
      }
      if (!Number.isInteger(num) || num < 0) {
        return false;
      }
    } else if (pattItem === '$key') {
      continue;
    } else {
      if (typeof pattItem.test === 'function') {
        if (!pattItem.test(targItem)) {
          return false;
        }
      } else if (typeof pattItem === 'function') {
        if (!pattItem(targItem)) {
          return false;
        }
      } else if (pattItem !== targItem) {
        return false;
      }
    }
  }
  return true;
}
