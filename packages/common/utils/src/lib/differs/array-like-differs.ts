/** @module differs */

type TrackByFunction<T = any> = (item: T) => any;
type ArrayLikeValue<T> = T[] | readonly T[] | Set<T>;

const TRACK_SELF: TrackByFunction = (e) => e;

/**
 * Describes the changes between two array-like structures.
 *
 * This interface represents the various types of changes that can occur when comparing
 * the original and updated array-like data, such as items being added, removed, changed,
 * or reordered.
 *
 * @template T The type of the items in the array-like structure.
 */
export interface ArrayLikeDiffChange<T> {
  /**
   * Indicates whether any changes were detected between the original and updated arrays.
   */
  hasChanged: boolean;

  /**
   * List of items that were added to the updated array, with their new index.
   */
  added: { index: number | null; newIndex: number; item: T }[];

  /**
   * List of items that were removed from the original array, along with their previous index.
   */
  removed: { previousIndex: number; newIndex: number | null; item: T }[];

  /**
   * List of items that were changed, along with their original and new indices.
   */
  changed: { previousIndex: number; newIndex: number; item: T }[];

  /**
   * List of items that were reordered, along with their original and new indices.
   */
  reordered: { previousIndex: number; newIndex: number; item: T }[];
}

/**
 * Options for customizing the behavior of the `ArrayLikeDiff` class.
 *
 * This interface allows you to specify custom options for tracking changes between array-like structures.
 * You can provide a custom `trackBy` function to determine how items are compared, such as comparing by
 * object ID or other criteria.
 *
 * @template T The type of the items in the array-like structure.
 */
export interface ArrayLikeDiffOptions<T> {
  /**
   * A function used to track and identify items within the array-like structure.
   *
   * The `trackBy` function allows you to customize how items in the array-like structure are compared.
   * For example, you may want to compare objects by their unique ID rather than their entire content.
   *
   *
   * @example
   * ```
   * const options: ArrayLikeDiffOptions<MyItem> = {
   *   trackBy: (item) => item.id
   * };
   * ```
   */
  trackBy: TrackByFunction<T>;
}

/**
 * Represents a class for managing and comparing array-like data structures.
 *
 * This class tracks the differences between the original and updated array-like structures
 * and provides detailed information about the changes, such as added, removed, changed,
 * and reordered items.
 *
 * @template T The type of the items in the array-like structures being compared.
 *
 * @example
 * ```
 * const originalArray = [1, 2, 3];
 * const updatedArray = [2, 3, 4];
 * const differ = new ArrayLikeDiff(originalArray);
 * const changes = differ.diff(updatedArray);
 * console.log(changes);
 * ```
 */
export class ArrayLikeDiff<T = any> {
  private originalArray: T[];
  private originalMap: Map<any, { index: number; item: T }>;
  private readonly trackBy: TrackByFunction<T>;

  /**
   * Creates a new instance of ArrayLikeDiff with the provided original data.
   *
   * @param original The original array-like value to track.
   * @param options An optional object to customize the diff options, like trackBy.
   *
   * @example
   * Example with default options:
   * ```
   * const diff = new ArrayLikeDiff([1, 2, 3]);
   * ```
   *
   * @example
   * Example with custom trackBy function:
   * ```
   * const diff = new ArrayLikeDiff([1, 2, 3], { trackBy: (item) => item.id });
   * ```
   */
  constructor(original: ArrayLikeValue<T>, options: Partial<ArrayLikeDiffOptions<T>> = {}) {
    this.trackBy = options.trackBy ?? TRACK_SELF;
    const { map, array } = this.toMapAndArray(original);
    this.originalArray = array;
    this.originalMap = map;
  }

  /**
   * Sets the original array-like value for diff tracking.
   *
   * This method allows you to update the original array-like value. After setting a new original
   * value, any further diff operations will compare against this new data.
   *
   * @param original The new array-like value to be considered as the original.
   */
  public setOriginal(original: ArrayLikeValue<T>) {
    const { map, array } = this.toMapAndArray(original);
    this.originalArray = array;
    this.originalMap = map;
  }

  /**
   * Computes the differences between the original and the updated array-like value.
   *
   * This method compares the original and updated values and returns an object describing
   * the changes such as added, removed, changed, and reordered items.
   *
   * @param updated The updated array-like value to compare against the original.
   * @param updateOriginal Whether to update the original array-like value after computing the diff.
   * @returns An object detailing the changes between the original and updated values.
   *
   * @example
   * Basic usage:
   * ```
   * const changes = diff.diff([2, 3, 4]);
   * console.log(changes);
   * ```
   *
   * @example
   * Don't update the original value after diff, so we can compare a new list with the old original list:
   * ```
   * const changes = diff.diff([2, 3, 4], false);
   * console.log(changes);
   * ```
   */
  public diff(updated: ArrayLikeValue<T>, updateOriginal = true) {
    const { map: updatedMap, array: updatedArray } = this.toMapAndArray(updated);

    const changes: ArrayLikeDiffChange<T> = {
      hasChanged: false,
      added: [],
      removed: [],
      changed: [],
      reordered: [],
    };

    this.originalArray.forEach((item, index) => {
      const key = this.trackBy(item);
      if (!updatedMap.has(key)) {
        changes.removed.push({ previousIndex: index, newIndex: null, item });
        changes.hasChanged = true;
      }
    });

    updatedArray.forEach((item, index) => {
      const key = this.trackBy(item);
      const originalEntry = this.originalMap.get(key);
      if (!originalEntry) {
        changes.added.push({ index: null, newIndex: index, item });
        changes.hasChanged = true;
      } else {
        const { item: originalItem, index: originalIndex } = originalEntry;
        const changed = JSON.stringify(originalItem) !== JSON.stringify(item);

        if (index !== originalIndex) {
          changes.reordered.push({ previousIndex: originalIndex, newIndex: index, item });
          changes.hasChanged = true;
        }
        if (changed) {
          changes.changed.push({ previousIndex: originalIndex, newIndex: index, item });
          changes.hasChanged = true;
        }
      }
    });

    if (updateOriginal) {
      this.originalMap = updatedMap;
      this.originalArray = updatedArray;
    }

    return changes;
  }

  private toMapAndArray(arrayLike: ArrayLikeValue<T>) {
    const array = Array.isArray(arrayLike) ? arrayLike : Array.from(arrayLike);
    const map = new Map(array.map((item, index) => [this.trackBy(item), { item, index }]));
    return { map, array };
  }
}
