/** @module signal */
import { computed, isSignal, Signal, untracked } from '@angular/core';

type IsRecord<T> = T extends object
  ? T extends unknown[]
    ? false
    : T extends Set<unknown>
      ? false
      : T extends Map<unknown, unknown>
        ? false
        : // eslint-disable-next-line @typescript-eslint/ban-types
          T extends Function
          ? false
          : true
  : false;

type IsUnknownRecord<T> = string extends keyof T ? true : number extends keyof T ? true : false;

type IsKnownRecord<T> = IsRecord<T> extends true ? (IsUnknownRecord<T> extends true ? false : true) : false;

/** @ignore */
export type DeepSignal<T> = Signal<T> &
  (IsKnownRecord<T> extends true
    ? Readonly<{
        [K in keyof T]: IsKnownRecord<T[K]> extends true ? DeepSignal<T[K]> : Signal<T[K]>;
      }>
    : unknown);

function isRecord(value: unknown): value is Record<string, unknown> {
  return value?.constructor === Object;
}

/**
 * Converts a given signal into a deep signal, allowing the tracking of nested object properties as signals.
 *
 * @template T The type of the value held by the signal.
 * @param signal The signal to convert into a deep signal.
 * @returns Returns a `DeepSignal` that proxies deeply nested object properties, allowing them to be signals.
 *
 * @example
 * ```typescript
 * const signal = signal({ name: 'John', address: { city: 'Vienna' } });
 * const deepSignal = toDeepSignal(signal);
 *
 * // Access deeply nested properties
 * console.log(deepSignal().address.city); // Vienna
 * console.log(deepSignal.address().city); // Vienna
 * console.log(deepSignal.address.city()); // Vienna
 * ```
 */
export function toDeepSignal<T>(signal: Signal<T>): DeepSignal<T> {
  const value = untracked(() => signal());
  if (!isRecord(value)) {
    return signal as DeepSignal<T>;
  }

  return new Proxy(signal, {
    get(target: any, prop) {
      if (!(prop in value)) {
        return target[prop];
      }

      if (!isSignal(target[prop])) {
        Object.defineProperty(target, prop, {
          value: computed(() => {
            return target()[prop];
          }),
          configurable: true,
        });
      }

      return toDeepSignal(target[prop]);
    },
  });
}
