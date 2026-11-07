/**
 * What a change callback receives besides the value: why the change happened and the event that
 * caused it. Every component exports its own alias with its reason union.
 */
export interface ChangeDetails<Reason extends string> {
  /** Why the change happened; a closed union per component, for example `'user' | 'form-reset'`. */
  readonly reason: Reason;
  /** The event that caused the change, or `null` when none did. */
  readonly event: Event | null;
}

/** {@link ChangeDetails} that also carry the new value, for outputs that have no separate value argument. */
export type ValueChangeDetails<T, Reason extends string> = ChangeDetails<Reason> & {
  /** The new value. */
  readonly value: T;
};
