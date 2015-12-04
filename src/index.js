/*
 * Copyright (c) 2015 by Greg Reimer <gregreimer@gmail.com>
 * MIT License. See mit-license.txt for more info.
 */

import Converter from './converter';
import Extractor from './extractor';

export default function graphify(opts) {
  return new Converter(opts);
}

export function extractor(...args) {
  return new Extractor(...args);
}