/** @module observer */

import { Observable, Subscriber } from 'rxjs';
import { share } from 'rxjs/operators';

import { toArray } from '../transform/to-array';

/**
 * Configuration options for creating an `IntersectionObserver`.
 *
 * This type extends `IntersectionObserverInit`, which includes properties such as
 * `root`, `rootMargin`, and `threshold`. These options control how the observer determines
 * when an element has intersected with the viewport or a specified root element.
 *
 * - **root**: The element used as the viewport for checking visibility of the target.
 *   Defaults to the browser viewport if null.
 * - **rootMargin**: Margin around the root element. Can be used to grow or shrink
 *   the area used for intersections.
 * - **threshold**: A single value or array of values from 0 to 1.0, indicating
 *   at what percentage of the target's visibility the observer's callback should be invoked.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/IntersectionObserver
 */
export type IntersectionObserverConfig = IntersectionObserverInit;

/**
 * Represents the changes observed by the `IntersectionObserver`. It includes the list
 * of `IntersectionObserverEntry` objects and the associated `IntersectionObserver`.
 */
export interface IntersectionObserverChanges {
  /** The list of entries observed by the `IntersectionObserver`. */
  entries: IntersectionObserverEntry[];
  /** The `IntersectionObserver` instance that triggered the entries. */
  observer: IntersectionObserver;
}

/**
 * Creates an observable that emits changes from an `IntersectionObserver` whenever
 * one or more elements intersect with the viewport or a specified root element.
 *
 * This function is useful for observing elements in a declarative and reactive manner, leveraging
 * RxJS to emit intersection events as observables. The observable is shared among multiple subscribers,
 * meaning the `IntersectionObserver` instance is reused, avoiding redundant observations.
 *
 * The `IntersectionObserver` will observe each element in the `elems` array individually, and it will
 * emit an `IntersectionObserverChanges` object whenever any of the observed elements intersects with
 * the viewport or the specified root element.
 *
 * The `config` parameter allows customization of the `IntersectionObserver`, letting you specify
 * options such as the threshold or root element, controlling when the observer is triggered.
 *
 * @param elements One or more elements to observe for intersection changes.
 * @param config Optional configuration object to customize the observer (e.g., root, rootMargin, threshold).
 * @returns An observable that emits `IntersectionObserverChanges` objects when an intersection change occurs.
 *
 * @example
 * ```typescript
 * const elements = document.querySelectorAll('.observe-me');
 * const observer$ = intersectionObserver$(elements, { threshold: 0.5 });
 *
 * observer$.subscribe(({ entries, observer }) => {
 *   entries.forEach((entry) => {
 *     console.log('Element intersected:', entry.target);
 *   });
 * });
 * ```
 */
export function intersectionObserver$(elements: Element | Element[], config?: IntersectionObserverConfig) {
  const elementsList = toArray(elements);
  const onObserverChanges = (subscriber: Subscriber<IntersectionObserverChanges>) => {
    const callBack: IntersectionObserverCallback = (entries, observer) => {
      subscriber.next({ entries, observer });
    };
    const onSubscribe = () => intersectionObserver.disconnect();

    const intersectionObserver = new IntersectionObserver(callBack, config);

    elementsList.forEach((elem) => intersectionObserver.observe(elem));

    return onSubscribe;
  };

  return new Observable<IntersectionObserverChanges>(onObserverChanges).pipe(share());
}
