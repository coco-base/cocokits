import { ComponentRef } from 'react';

import { ClassRef } from '@cocokits/core';

export function isClassRef(ref: any): ref is ClassRef {
  return typeof ref === 'function' && !!ref.prototype && ref.prototype.constructor === ref;
}

export function isReactComponent(ref: any): ref is ComponentRef<any> {
  return !!ref.displayName;
}
