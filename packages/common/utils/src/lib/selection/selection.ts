/** @module selection */

import { ArrayLikeDiff } from '../differs/array-like-differs';
import { CustomEventListener } from '../event-listener/custom-event-listener';

type TrackByFunction<T = any> = (item: T) => any;
type ChangesCallback<T> = (changes: SelectionChange<T>) => void;

/**
 * Configuration options for creating and updating a `Selection` instance.
 *
 * @template T The type of the items being selected.
 */
export interface SelectionOptions<T> {
  /**
   * Whether multiple values can be selected at once.
   * If set to `true`, the selection can hold multiple items. If set to `false` or omitted, only one item can be selected at a time.
   */
  multiple: boolean;

  /**
   * A custom function to track items by a specific property or value.
   * This function is used to compare items for equality when managing selections. Typically, this tracks by IDs or unique object properties.
   * If omitted, the default comparison is by reference equality.
   */
  trackBy: TrackByFunction<T>;

  /**
   * Determines whether the component should emit the change event exclusively when the value changes.
   *
   * - **When `true`**: The change event is dispatched only if the component's value is altered. This prevents redundant events when the same value is reselected or unchanged.
   * - **When `false`**: The change event may be emitted even if the value remains the same, allowing for scenarios where re-selection of the current value should trigger a change.
   *
   * This property is useful in scenarios where unnecessary change events could lead to performance issues or unintended side effects.
   *
   * @default true
   */
  onlyEmitOnValueChange?: boolean;
}

/**
 * Event emitted when the value of a Selection has changed.
 */
export interface SelectionChange<T> {
  /**
   * Custom string to identify the source of changes, allowing for the addition of custom logic based on different sources.
   * For example: it can be 'fromFormController' or 'fromUserInteraction'.
   */
  triggerSource?: string;
  /** Options that were added to the selection. */
  added: T[];
  /** Options that were removed from the selection. */
  removed: T[];
}

/**
 * Configuration options for updating the selection, such as skipping event emission.
 */
export interface SelectionUpdateConfig {
  /**
   * Whether to skip emitting the changes event after updating the selection.
   *
   * If set to `true`, no event will be emitted when the selection is updated. This is useful when you need to make multiple changes
   * in quick succession without notifying listeners for each change.
   */
  skipEmitEvent?: boolean;

  /**
   * A custom string used to identify the source of changes.
   * This can be useful for distinguishing between different sources of selection changes (e.g., user interaction, form control, etc.).
   */
  triggerSource?: string;
}

/**
 * A class for managing a selection of values with support for multiple selections and event listeners for changes.
 * This is a utility for powering selection of one or more options from a list and can be used in components such as the selection list, table selections and chip lists.
 *
 * The `Selection` class allows you to select, deselect, and manage a list of selected items. You can track changes,
 * restrict selection to a single item or multiple items, and emit events whenever the selection changes.
 *
 * @template T The type of the items being selected.
 *
 * @example
 * ```typescript
 * // Creating a new selection instance with multiple values allowed
 * const selection = new Selection<string>([], { multiple: true });
 *
 * // Selecting a single value
 * selection.select('apple');
 * console.log(selection.getSelected()); // ['apple']
 *
 * // Selecting multiple values
 * selection.select(['banana', 'orange']);
 * console.log(selection.getSelected()); // ['apple', 'banana', 'orange']
 *
 * // Deselecting a value
 * selection.deselect('banana');
 * console.log(selection.getSelected()); // ['apple', 'orange']
 * ```
 */
export class Selection<T = any> {
  private events = new CustomEventListener<SelectionChange<T>>();
  private isMultiple: boolean;
  private onlyEmitOnValueChange: boolean;
  private readonly selectionSet: Set<T>;

  private differs: ArrayLikeDiff<T>;

  /**
   * Creates a new `Selection` instance.
   *
   * @param selectedValues The initial values to be selected. Defaults to an empty array if no values are provided.
   * @param options An optional object to configure the selection behavior.
   *
   * - `multiple`: If `true`, allows multiple items to be selected. If `false` or omitted, only one item can be selected.
   * - `trackBy`: A function to customize how items are compared. By default, items are compared by reference.
   */
  constructor(selectedValues: T[] = [], options: Partial<SelectionOptions<T>> = {}) {
    this.isMultiple = options.multiple ?? false;
    this.onlyEmitOnValueChange = options.onlyEmitOnValueChange ?? true;
    this.selectionSet = new Set<T>(selectedValues);
    this.differs = new ArrayLikeDiff(this.selectionSet, { trackBy: options.trackBy });
  }

  private diffChangesAndEmit({ skipEmitEvent = false, triggerSource }: SelectionUpdateConfig = {}) {
    if (skipEmitEvent) {
      this.differs.setOriginal(this.selectionSet);
    }

    const changes = this.differs.diff(this.selectionSet);
    if (changes.hasChanged || !this.onlyEmitOnValueChange) {
      this.events.emit({
        triggerSource,
        added: changes.added.map((a) => a.item),
        removed: changes.removed.map((a) => a.item),
      });
    }
  }

  /**
   * Updates the selection options (such as enabling or disabling multiple selections).
   *
   * @param options Partial selection options to update.
   *
   * @example
   * ```typescript
   * const selection = new Selection<number>([1]);
   * selection.updateOptions({ multiple: true });
   * selection.select([2, 3, 4]);
   * console.log(selection.getSelected()); // [1, 2, 3, 4]
   * ```
   */
  public updateOptions(options: Partial<SelectionOptions<T>>) {
    this.isMultiple = options.multiple ?? this.isMultiple;
    this.verifyValueAssignment(Array.from(this.selectionSet));
    this.differs = new ArrayLikeDiff(this.selectionSet, { trackBy: options.trackBy });
  }

  /**
   * Adds an event listener that is triggered when the selection changes.
   *
   * @param callback The callback function to be executed on selection change.
   *
   * @example
   * ```typescript
   * const selection = new Selection<string>();
   * selection.addChangeEventListener(({ added, removed }) => {
   *   console.log('Added:', added);
   *   console.log('Removed:', removed);
   * });
   *
   * selection.select('apple'); // Logs: Added: ['apple'], Removed: []
   * selection.deselect('apple'); // Logs: Added: [], Removed: ['apple']
   * ```
   */
  public addChangeEventListener(callback: ChangesCallback<T>) {
    this.events.addEventListener(callback);
  }

  /**
   * Removes a previously added event listener for selection changes.
   *
   * @param callback The listener to remove.
   */
  public removeChangeEventListener(callback: ChangesCallback<T>) {
    this.events.removeEventListener(callback);
  }

  /**
   * Removes all event listeners for selection changes.
   */
  public removeAllChangeEventListener() {
    this.events.removeAllEventListener();
  }

  /**
   * Determines whether a specific value is selected.
   *
   * @param value The value to check.
   * @returns `true` if the value is selected, otherwise `false`.
   *
   * @example
   * ```typescript
   * const selection = new Selection<number>([1, 2]);
   * console.log(selection.isSelected(1)); // true
   * console.log(selection.isSelected(3)); // false
   * ```
   */
  isSelected(value: T): boolean {
    return this.selectionSet.has(value);
  }

  /**
   * Get a list of selected items.
   */
  getSelected() {
    return Array.from(this.selectionSet);
  }

  /**
   * Clears all selected values.
   *
   * @param config Optional configuration for clearing the selection (e.g., skip emitting events).
   */
  clear(config?: SelectionUpdateConfig): void {
    this.selectionSet.clear();
    this.diffChangesAndEmit(config);
  }

  /**
   * Selects a value or an array of values.
   *
   * @param values The values to select.
   * @param config Optional configuration for selecting the values (e.g., skip emitting events).
   *
   * @example
   * ```typescript
   * const selection = new Selection<number>();
   * selection.select([1, 2, 3]);
   * console.log(selection.getSelected()); // [1, 2, 3]
   * ```
   */
  select(values: T | T[], config?: SelectionUpdateConfig): void {
    const valuesArray = Array.isArray(values) ? values : [values];
    this.verifyValueAssignment(valuesArray);

    if (!this.isMultiple) {
      this.selectionSet.clear();
    }

    valuesArray.forEach((value) => this.selectionSet.add(value));

    this.diffChangesAndEmit(config);
  }

  /**
   * Deselects a value or an array of values.
   *
   * @param values The values to deselect.
   * @param config Optional configuration for deselecting the values (e.g., skip emitting events).
   *
   * @example
   * ```typescript
   * const selection = new Selection<number>([1, 2, 3]);
   * selection.deselect([2, 3]);
   * console.log(selection.getSelected()); // [1]
   * ```
   */
  deselect(values: T | T[], config?: SelectionUpdateConfig): void {
    const valuesArray = Array.isArray(values) ? values : [values];
    this.verifyValueAssignment(valuesArray);
    valuesArray.forEach((value) => this.selectionSet.delete(value));

    this.diffChangesAndEmit(config);
  }

  /**
   * Sets the selected values, replacing any existing selection.
   *
   * @param values The new selected values.
   * @param config Optional configuration for setting the values (e.g., skip emitting events).
   *
   * @example
   * ```typescript
   * const selection = new Selection<number>([1, 2, 3, 4]);
   * selection.setSelection([5, 6, 7]);
   * console.log(selection.getSelected()); // [5, 6, 7]
   * ```
   */
  setSelection(values: T | T[], config?: SelectionUpdateConfig): boolean | void {
    const valuesArray = Array.isArray(values) ? values : [values];
    this.verifyValueAssignment(valuesArray);

    this.selectionSet.clear();
    valuesArray.forEach((value) => this.selectionSet.add(value));

    this.diffChangesAndEmit(config);
  }

  /**
   * Toggles a value between selected and deselected.
   *
   * @param value The value to toggle.
   * @param config Optional configuration for toggling the value (e.g., skip emitting events).
   *
   * @example
   * ```typescript
   * const selection = new Selection<string>(['apple']);
   * selection.toggle('banana');
   * console.log(selection.getSelected()); // ['apple', 'banana']
   *
   * selection.toggle('apple');
   * console.log(selection.getSelected()); // ['banana']
   * ```
   */
  toggle(value: T, config?: SelectionUpdateConfig): void {
    return this.isSelected(value) ? this.deselect(value, config) : this.select(value, config);
  }

  /**
   * Determines whether the selection does not have a value.
   */
  isEmpty(): boolean {
    return this.selectionSet.size === 0;
  }

  /**
   * Gets whether multiple values can be selected.
   */
  isMultipleSelection() {
    return this.isMultiple;
  }

  /**
   * Determines whether the selection has a value.
   */
  hasValue(): boolean {
    return !this.isEmpty();
  }

  /**
   * Verifies the value assignment and throws an error if the specified value array is
   * including multiple values while the selection model is not supporting multiple values.
   */
  private verifyValueAssignment(values: T[]) {
    if (values.length > 1 && !this.isMultiple) {
      throw new Error('Cannot pass multiple values into Selection with single-value mode.');
    }
  }
}
