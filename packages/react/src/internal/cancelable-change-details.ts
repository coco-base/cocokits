import type { ChangeDetails } from '@cocokits/shared';

/**
 * What an overlay's `onOpenChange` receives besides the open state: the reason and the event behind the change,
 * and a way to refuse it. Calling `cancel()` keeps an uncontrolled overlay as it was; a dismissal (Escape, an
 * outside press, focus leaving) that is canceled counts as refused.
 */
export interface CancelableChangeDetails<Reason extends string> extends ChangeDetails<Reason> {
  /** Refuses the change. Call it inside `onOpenChange`; it has no effect later. */
  cancel(): void;
  /** Whether `cancel()` was called. */
  readonly isCanceled: boolean;
}

/** The details a caller passes: the same without the two members the state adds. */
export type PlainDetails<D> = D extends { cancel: unknown } ? Omit<D, 'cancel' | 'isCanceled'> : D;

/**
 * Adds `cancel()` and `isCanceled` to the details.
 *
 * @param details - The reason and the event.
 * @returns The cancelable details; `isCanceled` is read live.
 */
export function makeCancelable<Reason extends string>(details: ChangeDetails<Reason>): CancelableChangeDetails<Reason> {
  let canceled = false;
  return {
    ...details,
    cancel() {
      canceled = true;
    },
    get isCanceled() {
      return canceled;
    },
  };
}
