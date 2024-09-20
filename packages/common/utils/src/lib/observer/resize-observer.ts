/** @module observer */

import { Observable, Subscriber } from 'rxjs';
import { share } from 'rxjs/operators';

import { toArray } from '../transform/to-array';

/**
 * Configuration options for creating a `ResizeObserver`.
 *
 * This type extends `ResizeObserverOptions`, which includes the `box` property to specify
 * which box model to observe:
 * - **content-box**: The observer tracks changes to the element's content area (ignores padding and border).
 * - **border-box**: The observer tracks changes to the element's content, padding, and border (the full element size).
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver/ResizeObserver
 */
export type ResizeObserverConfig = ResizeObserverOptions;

/**
 * Represents the changes observed by the `ResizeObserver`. It includes the list
 * of `ResizeObserverEntry` objects and the associated `ResizeObserver`.
 */
export interface ResizeObserverChanges {
  /** The list of entries observed by the `ResizeObserver`. */
  entries: ResizeObserverEntry[];
  /** The `ResizeObserver` instance that triggered the entries. */
  observer: ResizeObserver;
}

/**
 * Creates an observable that emits changes from a `ResizeObserver` whenever
 * the size of one or more elements changes.
 *
 * This function is useful in reactive applications where you want to observe changes
 * to an element's size and respond to those changes using RxJS. By using `resizeObserver$`,
 * you can declaratively track resize events, such as when a UI component resizes dynamically,
 * and trigger responses like layout adjustments, animations, or data recalculations.
 *
 * The observable is shared among subscribers, meaning the `ResizeObserver` instance is reused
 * and multiple subscribers won't trigger redundant resize observations. If multiple elements
 * are provided, each is observed individually.
 *
 *
 * @param elems One or more elements to observe for size changes.
 * @param config Optional configuration object to customize which box model to observe.
 * @returns An observable that emits `ResizeObserverChanges` objects when size changes occur.
 *
 * @example
 * ```typescript
 * const element = document.getElementById('resize-me');
 * const observer$ = resizeObserver$(element, { box: 'content-box' });
 *
 * observer$.subscribe(({ entries, observer }) => {
 *   entries.forEach((entry) => {
 *     console.log('Element resized:', entry.target);
 *     console.log('New size:', entry.contentRect);
 *   });
 * });
 * ```
 */
export function resizeObserver$(elems: Element | Element[], config?: ResizeObserverConfig) {
  const elemsList = toArray(elems);

  const onResizeChange = (subscriber: Subscriber<ResizeObserverChanges>) => {
    const callBack: ResizeObserverCallback = (entries, observer) => subscriber.next({ entries, observer });
    const onUnSubscribe = () => resizeObserver.disconnect();
    const resizeObserver = new ResizeObserver(callBack);
    elemsList.forEach((elem) => resizeObserver.observe(elem, config || {}));
    return onUnSubscribe;
  };

  return new Observable<ResizeObserverChanges>(onResizeChange).pipe(share());
}
