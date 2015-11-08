/*
 * Copyright (c) 2015 by Greg Reimer <gregreimer@gmail.com>
 * MIT License. See mit-license.txt for more info.
 */

import createAmender from './create-amender';

export default function compilePattern(pattern) {

  const newPattern = Object.assign({
    idProp: 'id',
    if: thing => thing && thing[newPattern.idProp] !== undefined
  }, pattern);

  if (typeof newPattern.if === 'string') {
    const ifTypeof = newPattern.if;
    newPattern.if = thing => typeof thing === ifTypeof;
  }

  newPattern.amend = createAmender(newPattern);
  return newPattern;
}
