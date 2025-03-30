/** @module observer */

import { Observable, Subscriber } from 'rxjs';
import { share } from 'rxjs/operators';

import { toArray } from '../transform/to-array';

/**
 * Configuration options for creating a `MutationObserver`.
 *
 * This type extends `MutationObserverInit`, which includes properties such as
 * `attributes`, `childList`, and `subtree` to specify what types of mutations to observe.
 *
 * - **attributes**: Set to `true` to observe changes to attributes on the target elements.
 * - **childList**: Set to `true` to observe changes to the direct children of the target.
 * - **subtree**: Set to `true` to observe mutations within the target's descendants.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/MutationObserver
 */
export type MutationObserverConfig = MutationObserverInit;

/**
 * Represents the changes observed by the `MutationObserver`. It includes the list
 * of `MutationRecord` objects and the associated `MutationObserver`.
 */
export interface MutationObserverChanges {
  /** The list of mutation records detected by the `MutationObserver`. */
  entries: MutationRecord[];
  /** The `MutationObserver` instance that observed the mutations. */
  observer: MutationObserver;
}

/**
 * Creates an observable that emits changes from a `MutationObserver` whenever
 * mutations occur in the target elements, such as attribute changes, child node modifications,
 * or changes in the subtree, depending on the configuration.
 *
 * This function is useful for observing DOM changes in a declarative and reactive way, leveraging
 * RxJS to emit mutation events as observables. It allows users to track mutations in a stream and
 * respond reactively to changes in the DOM.
 *
 * The observable is shared among subscribers, meaning the `MutationObserver` instance is reused,
 * preventing redundant mutation observations. If multiple elements are passed, each is observed
 * individually, and changes are emitted as they occur.
 *
 * @param elems One or more elements to observe for mutations.
 * @param config Configuration object to customize what mutations to observe (e.g., attributes, childList, subtree).
 * @returns An observable that emits `MutationObserverChanges` objects when mutations occur.
 *
 * @example
 * ```typescript
 * const element = document.getElementById('observed-element');
 * const observer$ = mutationObserver$(element, { attributes: true, childList: true });
 *
 * observer$.subscribe(({ entries, observer }) => {
 *   entries.forEach((entry) => {
 *     console.log('Mutation observed:', entry);
 *   });
 * });
 * ```
 */
export function mutationObserver$(elems: Document | Element | Element[], config: MutationObserverConfig) {
  const elemsList = toArray(elems);
  const onMutationChange = (subscriber: Subscriber<MutationObserverChanges>) => {
    const callBack: MutationCallback = (entries, observer) => subscriber.next({ entries, observer });
    const onUnSubscribe = () => mutationObserver.disconnect();
    const mutationObserver = new MutationObserver(callBack);
    elemsList.forEach((elem) => mutationObserver.observe(elem, config));

    return onUnSubscribe;
  };

  return new Observable<MutationObserverChanges>(onMutationChange).pipe(share());
}
