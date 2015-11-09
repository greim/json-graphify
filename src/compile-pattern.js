/*
 * Copyright (c) 2015 by Greg Reimer <gregreimer@gmail.com>
 * MIT License. See mit-license.txt for more info.
 */

import deepFreeze from 'deep-freeze';
import createAmender from './create-amender';

export default function compilePattern(pattern) {

  const newPattern = Object.assign({ idAttribute: 'id' }, pattern);

  if (newPattern.to) {
    newPattern.amend = createAmender(newPattern);
  }

  return deepFreeze(newPattern);
}
