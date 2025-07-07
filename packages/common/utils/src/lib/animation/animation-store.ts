/** @module _hidden */

import { DeepPartial } from '../model/common.model';
import { deepClone } from '../uncategorized/deep-clone';
import { deepMerge } from '../uncategorized/deep-merge';

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
