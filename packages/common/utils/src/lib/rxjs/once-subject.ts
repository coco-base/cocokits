/** @module rxjs */

import { Subject } from 'rxjs';

/**
 * A specialized `Subject` that emits a single value to subscribers and then automatically completes.
 *
 * This class extends `Subject` and modifies its behavior to ensure that after the first value is emitted,
 * the subject completes, preventing any further emissions. This is useful in scenarios where only one
 * event or value needs to be broadcast (e.g., a one-time notification or configuration load).
 *
 * Unlike a `ReplaySubject`, any subscribers added after the subject has completed will not receive the emitted value
 * or the complete notification.
 *
 * @template T The type of value being emitted.
 *
 * @example
 * Broadcasting a single value:
 * ```typescript
 * const subject = new OnceSubject<number>();
 * subject.subscribe({
 *   next: (value) => console.log('Received:', value),
 *   complete: () => console.log('Completed')
 * });
 *
 * subject.next(42);
 * // Outputs: Received: 42
 * // Outputs: Completed
 *
 * subject.next(100); // No further emissions, as the subject is completed
 * ```
 *
 * @example
 * Late subscriber:
 * ```typescript
 * const subject = new OnceSubject<number>();
 * subject.next(42); // Immediately completes after this
 *
 * subject.subscribe({
 *   next: (value) => console.log('Received:', value),
 *   complete: () => console.log('Completed')
 * });
 * // No output, since the subject has already completed
 * ```
 */
export class OnceSubject<T> extends Subject<T> {
  /** @ignore */
  constructor() {
    super();
  }

  /** @ignore */
  override next(value: T) {
    super.next(value);
    this.complete();
  }
}
