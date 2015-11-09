/*
 * Copyright (c) 2015 by Greg Reimer <gregreimer@gmail.com>
 * MIT License. See mit-license.txt for more info.
 */

import createAmender from './create-amender';

export default function compilePattern(pattern) {

  const newPattern = Object.assign({
    idAttribute: 'id'
  }, pattern);

  newPattern.amend = createAmender(newPattern);
  return Object.freeze(newPattern);
}
