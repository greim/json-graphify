/*
 * Copyright (c) 2015 by Greg Reimer <gregreimer@gmail.com>
 * MIT License. See mit-license.txt for more info.
 */

import Converter from './converter';

export default function(opts) {
  const converter = new Converter(opts);
  function toPathValues(json) {
    return converter.toPathValues(json);
  }
  function toGraph(json) {
    return converter.toGraph(json);
  }
  return { toPathValues, toGraph };
}
