/** @module data-source */

import { DEFAULT_SORT_DIRECTION, SortConfig, SortDirection } from "./data-source.model";


/**
 * Single field sort representation. Toggle cycles through: none -> asc -> desc -> none
 * _direction is always available and never undefined (defaults to 'asc').
 */
export class DataSourceSortField<T> {
  public readonly field: keyof T;
  private _direction: SortDirection;

  constructor(field: keyof T, direction: SortDirection = DEFAULT_SORT_DIRECTION) {
    this.field = field;
    this._direction = direction;
  }

  public get direction(): SortDirection {
    return this._direction;
  }

  public setDirection(dir: SortDirection) {
    this._direction = dir;
  }

  /**
   * Toggle the direction.
   * If `allowNone` is true (default) cycle: none -> asc -> desc -> none
   * If `allowNone` is false cycle: asc <-> desc (none acts as asc on first toggle)
   */
  public toggle(allowNone = true): void {
    if (!allowNone) {
      // compact cycle: asc <-> desc (none becomes asc on first toggle)
      if (this._direction === 'none') {
        this._direction = 'asc';
        return;
      }
      if (this._direction === 'asc') {
        this._direction = 'desc';
        return;
      }
      // desc -> asc
      this._direction = 'asc';
      return;
    }

    // allowNone === true: none -> asc -> desc -> none
    if (this._direction === 'none') {
      this._direction = 'asc';
      return;
    }
    if (this._direction === 'asc') {
      this._direction = 'desc';
      return;
    }
    // desc -> none
    this._direction = 'none';
  }

  public getConfig(): SortConfig<T> | undefined {
    if (this._direction === 'none') {
      return;
    }
    return { field: this.field, direction: this._direction } as SortConfig<T>;
  }
}
