import type { SelectItemData, SelectItems } from './select.types';

/**
 * The `items` of a Select as a list of entries: a record maps each key to a value and its label.
 *
 * @param items - The `items` prop.
 * @returns The entries; none without `items`.
 */
export function normalizeItems<T>(items: SelectItems<T> | undefined): readonly SelectItemData<T>[] {
  if (!items) return [];
  if (Array.isArray(items)) return items as readonly SelectItemData<T>[];
  const record = items as Readonly<Record<string, string>>;
  return Object.entries(record).map(([value, label]) => ({ value: value as T, label }));
}

/** An item a browser autofill can pick: its value and whether it may not be chosen. */
export interface SelectCandidate<T> {
  readonly value: T;
  readonly disabled: boolean;
}

/**
 * The enabled candidate whose form string is `written`.
 *
 * @param candidates - The mounted items while the list is open, else the `items` entries.
 * @param written - The text the browser wrote to the hidden input.
 * @param toFormString - The form string of a value.
 * @returns The candidate, or `undefined` when none matches.
 */
export function findCandidate<T>(
  candidates: readonly SelectCandidate<T>[],
  written: string,
  toFormString: (value: T) => string,
): SelectCandidate<T> | undefined {
  return candidates.find((candidate) => !candidate.disabled && toFormString(candidate.value) === written);
}
