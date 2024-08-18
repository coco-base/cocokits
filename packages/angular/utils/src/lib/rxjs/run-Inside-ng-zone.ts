import { inject, NgZone } from '@angular/core';

import { Observable, OperatorFunction } from 'rxjs';

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
