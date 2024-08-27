type TrackByFunction<T = any> = (item: T) => any;
type ArrayLikeValue<T> = T[] | readonly T[] | Set<T>;

export interface ArrayLikeDiffChange<T> {
  hasChanged: boolean;
  added: { index: number | null; newIndex: number; item: T }[];
  removed: { previousIndex: number; newIndex: number | null; item: T }[];
  changed: { previousIndex: number; newIndex: number; item: T }[];
  reordered: { previousIndex: number; newIndex: number; item: T }[];
}

export interface ArrayLikeDiffOptions<T> {
  trackBy: TrackByFunction<T>;
}

const TRACK_SELF: TrackByFunction = (e) => e;

export class ArrayLikeDiff<T = any> {
  private originalArray: T[];
  private originalMap: Map<any, { index: number; item: T }>;
  private readonly trackBy: TrackByFunction<T>;

  constructor(original: ArrayLikeValue<T>, options: Partial<ArrayLikeDiffOptions<T>> = {}) {
    this.trackBy = options.trackBy ?? TRACK_SELF;
    const { map, array } = this.toMapAndArray(original);
    this.originalArray = array;
    this.originalMap = map;
  }

  public setOriginal(original: ArrayLikeValue<T>) {
    const { map, array } = this.toMapAndArray(original);
    this.originalArray = array;
    this.originalMap = map;
  }

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
