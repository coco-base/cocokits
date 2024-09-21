/** This file will skip by typedoc build */

import { inject, NgZone } from '@angular/core';

import { Observable, OperatorFunction } from 'rxjs';

/**
 * Executes the given observable within the Angular zone, ensuring that change detection is triggered
 * for each emission from the observable. It wraps the observable's emissions in `NgZone.run` to ensure
 * that Angular's change detection is properly triggered.
 *
 *
 * @param zone The `NgZone` instance used to run the observable's emissions inside Angular's zone.
 * If not provided, `NgZone` will be injected automatically.
 * @returns A function that returns a new observable running inside the Angular zone.
 */
export function runInsideNgZone<T>(zone = inject(NgZone)): OperatorFunction<T, T> {
  return (source) =>
    new Observable<T>((observer) =>
      source.subscribe({
        next: (x) => zone.run(() => observer.next(x)),
        error: (err) => zone.run(() => observer.error(err)),
        complete: () => zone.run(() => observer.complete()),
      })
    );
}
