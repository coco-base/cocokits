import { EventListener } from './event-listner';
import { ArrayLikeDiff } from '../differs/array-like-differs';

type TrackByFunction<T = any> = (item: T) => any;
type ChangesCallback<T> = (changes: SelectionChange<T>) => void;

export interface SelectionOptions<T> {
  multiple: boolean;
  trackBy: TrackByFunction<T>;
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

export interface SelectionUpdateConfig {
  skipEmitEvent?: boolean;
  triggerSource?: string;
}

export class Selection<T = any> {
  private events = new EventListener<SelectionChange<T>>();
  private isMultiple: boolean;
  private readonly selectionSet: Set<T>;

  private differs: ArrayLikeDiff<T>;

  constructor(selectedValues: T[] = [], options: Partial<SelectionOptions<T>> = {}) {
    this.isMultiple = options.multiple ?? false;
    this.selectionSet = new Set<T>(selectedValues);
    this.differs = new ArrayLikeDiff(this.selectionSet, { trackBy: options.trackBy });
  }

  private diffChangesAndEmit({ skipEmitEvent = false, triggerSource }: SelectionUpdateConfig = {}) {
    if (skipEmitEvent) {
      this.differs.setOriginal(this.selectionSet);
    }

    const changes = this.differs.diff(this.selectionSet);
    if (changes.hasChanged) {
      this.events.emit({
        triggerSource,
        added: changes.added.map((a) => a.item),
        removed: changes.removed.map((a) => a.item),
      });
    }
  }

  public updateOptions(options: Partial<SelectionOptions<T>>) {
    this.isMultiple = options.multiple ?? this.isMultiple;
    this.verifyValueAssignment(Array.from(this.selectionSet));
    this.differs = new ArrayLikeDiff(this.selectionSet, { trackBy: options.trackBy });
  }

  public addChangeEventListener(callback: ChangesCallback<T>) {
    this.events.addEventListener(callback);
  }

  public removeChangeEventListener(callback: ChangesCallback<T>) {
    this.events.removeEventListener(callback);
  }

  public removeAllChangeEventListener() {
    this.events.removeAllEventListener();
  }

  /**
   * Determines whether a value is selected.
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
   * Clears all of the selected values.
   * @param skipEmitEvent Whether to skip emitting the changes event.
   */
  clear(config?: SelectionUpdateConfig): void {
    this.selectionSet.clear();
    this.diffChangesAndEmit(config);
  }

  /**
   * Selects a value or an array of values.
   * @param values The values to select
   * @param skipEmitEvent Whether to skip emitting the changes event.
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
   * @param values The values to deselect
   * @param skipEmitEvent Whether to skip emitting the changes event.
   */
  deselect(values: T | T[], config?: SelectionUpdateConfig): void {
    const valuesArray = Array.isArray(values) ? values : [values];
    this.verifyValueAssignment(valuesArray);
    valuesArray.forEach((value) => this.selectionSet.delete(value));

    this.diffChangesAndEmit(config);
  }

  /**
   * Sets the selected values
   * @param values The new selected values
   * @param skipEmitEvent Whether to skip emitting the changes event.
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
   * @param value The value to toggle
   * @param skipEmitEvent Whether to skip emitting the changes event.
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
