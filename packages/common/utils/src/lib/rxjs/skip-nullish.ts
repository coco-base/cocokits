/** @module rxjs */

import { filter, Observable, pipe } from 'rxjs';

/**
 * An RxJS operator that filters out `null` and `undefined` values from the observable stream.
 *
 * This operator is useful when you want to ensure that subscribers only receive non-nullish values.
 * It removes `null` and `undefined` from the stream, passing through all other values, including other
 * falsy values like `0`, `false`, and `''` (which are not filtered out).
 *
 * @template T The type of value being emitted by the source observable.
 * @returns A function that takes an observable source and returns an observable that only emits non-nullish values.
 *
 * @example
 * ```typescript
 * const source$ = new Observable<string | null | undefined>((observer) => {
 *   observer.next('Hello');
 *   observer.next(null);
 *   observer.next(0);
 *   observer.next(false);
 *   observer.next('');
 *   observer.next('World');
 *   observer.next(undefined);
 *   observer.complete();
 * });
 *
 * const filtered$ = source$.pipe(skipNullish());
 *
 * filtered$.subscribe((value) => console.log(value));
 * // Outputs:
 * // 'Hello'
 * // 0
 * // false
 * // ''
 * // 'World'
 * ```
 */
export function skipNullish<T>(): (source: Observable<T>) => Observable<NonNullable<T>> {
  return pipe(filter((value: T): value is NonNullable<T> => value !== null && value !== undefined));
}
