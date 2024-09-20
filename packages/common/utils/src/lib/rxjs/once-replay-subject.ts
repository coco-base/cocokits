/** @module rxjs */

import { ReplaySubject } from 'rxjs';
import { TimestampProvider } from 'rxjs/internal/types';

/**
 * A specialized `ReplaySubject` that emits a single value to subscribers and then automatically completes.
 *
 * This class extends `ReplaySubject` but modifies its behavior to ensure that after the first value is emitted,
 * the subject completes, preventing any further emissions.
 *
 * `OnceReplaySubject` is useful in scenarios where you need to broadcast a value once (e.g., a configuration load or
 * one-time event) and ensure no further updates or emissions are sent after the first value.
 *
 * Subscribers added after the first emission will still receive the last value before the subject completes,
 * just like a normal `ReplaySubject`.
 *
 *
 * @template T The type of value being emitted.
 *
 * @example
 * ```typescript
 * const subject = new OnceReplaySubject<number>();
 * subject.subscribe({
 *   next: (value) => console.log('Received:', value),
 *   complete: () => console.log('Completed')
 * });
 *
 * subject.next(42);
 * // Outputs: Received: 42
 * // Completed
 *
 * subject.next(100); // No further emissions, as the subject has completed
 * ```
 *
 * @example
 * Multiple subscribers:
 * ```typescript
 * const subject = new OnceReplaySubject<number>();
 * subject.next(10);
 *
 * subject.subscribe({
 *   next: (value) => console.log('Subscriber 1 received:', value),
 *   complete: () => console.log('Subscriber 1 completed')
 * });
 *
 * subject.subscribe({
 *   next: (value) => console.log('Subscriber 2 received:', value),
 *   complete: () => console.log('Subscriber 2 completed')
 * });
 *
 * // Outputs for both subscribers:
 * // Subscriber 1 received: 10
 * // Subscriber 1 completed
 * // Subscriber 2 received: 10
 * // Subscriber 2 completed
 * ```
 */
export class OnceReplaySubject<T> extends ReplaySubject<T> {
  /** @ignore */
  constructor(_bufferSize?: number, _windowTime?: number, _timestampProvider?: TimestampProvider) {
    super(_bufferSize, _windowTime, _timestampProvider);
  }

  /** @ignore */
  override next(value: T) {
    super.next(value);
    this.complete();
  }
}
