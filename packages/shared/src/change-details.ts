/**
 * What a change callback receives besides the value: why the change happened and the event that
 * caused it. Every component exports its own alias with its reason union.
 *
 * @typeParam Reason - The reasons of the component, for example `'user' | 'form-reset'`.
 */
export interface ChangeDetails<Reason extends string> {
  /** Why the change happened; a closed union per component, for example `'user' | 'form-reset'`. */
  readonly reason: Reason;
  /** The event that caused the change, or `null` when none did. */
  readonly event: Event | null;
}

/**
 * {@link ChangeDetails} that also carry the new value, for outputs that have no separate value argument.
 *
 * @typeParam T - The type of the value, for example `boolean` for a checkbox.
 * @typeParam Reason - The reasons of the component, for example `'user' | 'form-reset'`.
 */
export type ValueChangeDetails<T, Reason extends string> = ChangeDetails<Reason> & {
  /** The new value. */
  readonly value: T;
};
