/** @module rxjs */

import { filter, Observable, pipe } from 'rxjs';

export function skipNullish<T>(): (source: Observable<T>) => Observable<NonNullable<T>> {
  return pipe(filter((value: T): value is NonNullable<T> => value !== null && value !== undefined));
}
