/** @module _hidden */

import { deepClone } from '../uncategorized/deep-clone';
import { deepMerge } from '../uncategorized/deep-merge';

// TODO: It's duplicate between core and utils, but we can not use core in utils, so we need to keep it here.
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export class AnimationStore<T> {
  private _value: T;

  public get value() {
    return this._value;
  }

  constructor(value: T) {
    this._value = deepClone(value);
  }

  public set(value: T) {
    this._value = deepClone(value);
  }

  public deepSet(value: DeepPartial<T>) {
    this.set(deepMerge(this.value, value));
  }

  public clone(): T {
    return deepClone(this.value);
  }
}
