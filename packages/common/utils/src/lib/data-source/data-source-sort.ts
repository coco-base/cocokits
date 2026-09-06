/** @module data-source */

import { DataSourceSortField } from './data-source-sort-field';
import { DEFAULT_SORT_DIRECTION, SortConfig, SortDirection } from './data-source.model';

/**
 * Manager for multiple `DataSourceSortField` items. Supports single or multi-mode.
 */
export class DataSourceSort<T> {
  private sortFields: DataSourceSortField<T>[] = [];
  private multi = false;

  constructor(multi = true) {
    this.multi = multi;
  }

  public setMulti(multi: boolean) {
    this.multi = multi;
    if (!this.multi && this.sortFields.length > 1) {
      // keep only the first when switching to single
      this.sortFields = [this.sortFields[0]];
    }
  }

  public isMulti(): boolean {
    return this.multi;
  }

  private findIndex(field: keyof T) {
    return this.sortFields.findIndex((sf) => sf.field === field);
  }

  /**
   * Add a sort field. In single mode replaces existing sort, in multi mode appends (no duplicates).
   */
  public add(field: keyof T, direction: SortDirection = DEFAULT_SORT_DIRECTION, priority?: number): void {
    const idx = this.findIndex(field);
    if (idx !== -1) {
      this.sortFields[idx].setDirection(direction);
      // move if priority provided
      if (typeof priority === 'number') {
        this.setPriority(field, Math.max(0, Math.min(this.sortFields.length - 1, priority - 1)));
      }
      return;
    }
    const newField = new DataSourceSortField<T>(field, direction);
    if (!this.multi) {
      this.sortFields = [newField];
      return;
    }

    if (typeof priority === 'number') {
      const insertIndex = Math.max(0, Math.min(this.sortFields.length, priority - 1));
      this.sortFields.splice(insertIndex, 0, newField);
    } else {
      this.sortFields.push(newField);
    }
  }

  /**
   * Remove the sort field instance by field
   */
  public remove(field: keyof T): void {
    this.sortFields = this.sortFields.filter((sf) => sf.field !== field);
  }

  /**
   * Set (or replace) a sort. In single mode this becomes the only sort.
   */
  public set(field: keyof T, direction: SortDirection): void {
    const idx = this.findIndex(field);
    if (idx !== -1) {
      this.sortFields[idx].setDirection(direction);
    } else {
      const f = new DataSourceSortField<T>(field, direction);
      if (!this.multi) {
        this.sortFields = [f];
      } else {
        this.sortFields.push(f);
      }
    }

    if (!this.multi && this.sortFields.length > 1) {
      this.sortFields = [this.sortFields[this.sortFields.length - 1]];
    }
  }

  /**
   * Toggle a field. If toggled to none it will be removed from the list.
   * Behavior differs for single vs multi mode: in single mode toggling a field replaces other fields.
   */
  public toggle(field: keyof T, allowNone = true): void {
    // toggle must use the class-level multi flag; do nothing if field not found
    const idx = this.findIndex(field);
    if (idx === -1) {
      return;
    }

    const sortField = this.sortFields[idx];
    sortField.toggle(allowNone);
    if (sortField.direction === 'none') {
      this.remove(field);
    } else if (!this.multi) {
      // single: ensure it's the only one
      this.sortFields = [sortField];
    }
  }

  /**
   * Toggle existing field or add it if not present (inserts with asc direction).
   */
  public toggleOrAdd(field: keyof T, allowNone = true): void {
    const idx = this.findIndex(field);
    if (idx === -1) {
      // not present -> add respecting multi
      if (!this.multi) {
        this.sortFields = [new DataSourceSortField<T>(field, 'asc')];
      } else {
        this.sortFields.push(new DataSourceSortField<T>(field, 'asc'));
      }
      return;
    }
    this.toggle(field, allowNone);
  }

  /**
   * Clear all sorts
   */
  public clearAll(): void {
    this.sortFields = [];
  }

  /**
   * Reorder the internal list – moving the given field to the target index (0-based).
   */
  /**
   * Set priority (0-based index) for the given field. If not found, do nothing.
   */
  public setPriority(field: keyof T, priority: number): void {
    const idx = this.findIndex(field);
    if (idx === -1) {
      return;
    }
    const [item] = this.sortFields.splice(idx, 1);
    const insertIndex = Math.max(0, Math.min(this.sortFields.length, priority));
    this.sortFields.splice(insertIndex, 0, item);
  }

  /**
   * Return current sorts as SortConfig array (in order).
   */
  public getSortConfigs(): SortConfig<T>[] {
    return this.sortFields
      .map((sf) => sf.getConfig())
      .filter((c): c is SortConfig<T> => !!c) // filter out undefined (direction 'none')
      .map((c) => ({ field: c.field, direction: c.direction }));
  }

  /**
   * Apply sorts to data. Returns a sorted copy.
   */
  public apply(data: T[]): T[] {
    const configs = this.getSortConfigs();
    if (!configs || configs.length === 0) {
      return data;
    }

    const result = [...data].sort((a, b) => {
      for (const s of configs) {
        const fa = a[s.field];
        const fb = b[s.field];
        const cmp = compareValues(fa, fb);
        if (cmp !== 0) return s.direction === 'asc' ? cmp : -cmp;
      }
      return 0;
    });

    return result;
  }

  // (No backwards-compatible aliases - API is the dedicated class methods.)
}

function compareValues(a: unknown, b: unknown): number {
  // treat null/undefined as less than any value
  const aEmpty = a === null || a === undefined;
  const bEmpty = b === null || b === undefined;
  if (aEmpty && bEmpty) {
    return 0;
  }
  if (aEmpty) {
    return -1;
  }
  if (bEmpty) {
    return 1;
  }

  // Dates
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime();
  }

  // numbers
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }

  // booleans -> true > false
  if (typeof a === 'boolean' && typeof b === 'boolean') {
    return Number(a) - Number(b);
  }

  // strings (fallback)
  const sa = String(a);
  const sb = String(b);
  return sa.localeCompare(sb);
}
