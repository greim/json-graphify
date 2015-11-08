/*
 * Copyright (c) 2015 by Greg Reimer <gregreimer@gmail.com>
 * MIT License. See mit-license.txt for more info.
 */

export default function(match, patterns, path) {
  for (let pattern of patterns) {
    if (match(pattern.from, path)) {
      return pattern;
    }
  }
}
