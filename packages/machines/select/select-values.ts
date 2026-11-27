import type { TypeaheadItem } from '@cocokits/cdk/roving-focus';
import type { SelectItem, SelectState } from './select.types';

const isNullish = (value: unknown): boolean => value === undefined || value === null;

/**
 * The option a single Select with `canSelectNullableOptions` shows as selected while its value is empty: the
 * first option whose value is `null` or `undefined`.
 */
function nullableSelectedItem<T>(state: SelectState<T>): SelectItem<T> | undefined {
  if (state.multiple || state.canSelectNullableOptions !== true || !isNullish(state.value)) return undefined;
  return state.items.find((item) => isNullish(item.value));
}

/** The selected values as a list: a single value is a list of one, an empty single value is `[]`. */
export function selectedValues<T>(state: SelectState<T>): readonly T[] {
  const { value } = state;
  if (state.multiple) return Array.isArray(value) ? (value as readonly T[]) : [];
  const nullable = nullableSelectedItem(state);
  if (nullable) return [nullable.value];
  return isNullish(value) ? [] : [value as T];
}

/**
 * Whether nothing is selected: no values with `multiple`; `undefined`, `null` or `''` otherwise. The empty
 * string is the value of a clearing option, so it shows the placeholder. With `canSelectNullableOptions`, an
 * empty single Select that has an option with a `null` or `undefined` value counts that option as selected.
 *
 * @param state - The Select state.
 * @returns `true` while the placeholder should show.
 */
export function isSelectEmpty<T>(state: SelectState<T>): boolean {
  if (state.multiple) return selectedValues(state).length === 0;
  if (nullableSelectedItem(state)) return false;
  const { value } = state;
  return isNullish(value) || (value as unknown) === '';
}

/**
 * The values the custom trigger receives: the selected values in value order, none while the Select is
 * empty (a single Select whose value is `''` shows the placeholder, so it has none).
 *
 * @param state - The Select state.
 * @returns The values to show.
 */
export function getSelectPreviewValues<T>(state: SelectState<T>): readonly T[] {
  return isSelectEmpty(state) ? [] : selectedValues(state);
}

/** Whether two values are the same one, with `isItemEqual`, defaulting to `Object.is`. */
export function isSameValue<T>(state: SelectState<T>, a: T, b: T): boolean {
  return state.isItemEqual ? state.isItemEqual(a, b) : Object.is(a, b);
}

/** Whether a value is among the selected ones. */
export function isValueSelected<T>(state: SelectState<T>, value: T): boolean {
  return selectedValues(state).some((selected) => isSameValue(state, selected, value));
}

/** The label fallback of a value no option text gives: `itemToStringLabel(value)`, else `String(value)`. */
function fallbackLabel<T>(state: SelectState<T>, value: T): string {
  return state.itemToStringLabel ? state.itemToStringLabel(value) : String(value);
}

/**
 * The label of one option: its own `label` when it has text, else `itemToStringLabel(value)`, else `String(value)`.
 *
 * @param state - The Select state.
 * @param item - The option.
 * @returns The label.
 */
export function itemLabel<T>(state: SelectState<T>, item: SelectItem<T>): string {
  return item.label?.trim() ? item.label : fallbackLabel(state, item.value);
}

/** The label of a selected value: that of the option that matches it, else the fallback. */
function valueLabel<T>(state: SelectState<T>, value: T): string {
  const item = state.items.find((candidate) => isSameValue(state, candidate.value, value));
  return item ? itemLabel(state, item) : fallbackLabel(state, value);
}

/**
 * The text of the trigger when there is no custom trigger: the label of the selected value, or, with `multiple`,
 * of the first selected value (the others are the count, see {@link getSelectCountText}). Empty while nothing is
 * selected.
 *
 * @param state - The Select state.
 * @returns The text.
 */
export function getSelectValueText<T>(state: SelectState<T>): string {
  const [first] = isSelectEmpty(state) ? [] : selectedValues(state);
  return first === undefined ? '' : valueLabel(state, first);
}

/**
 * The text of the count: `+N` for the N selected values after the first one, with `multiple`.
 *
 * @param state - The Select state.
 * @returns The text, or `undefined` while fewer than two values are selected or the Select is single.
 */
export function getSelectCountText<T>(state: SelectState<T>): string | undefined {
  const others = state.multiple ? selectedValues(state).length - 1 : 0;
  return others > 0 ? `+${String(others)}` : undefined;
}

/** The string a value submits with the form: `itemToStringValue(value)`, else `String(value)`; `''` for a nullish value. */
export function valueToFormString<T>(state: SelectState<T>, value: T): string {
  if (isNullish(value)) return '';
  return state.itemToStringValue ? state.itemToStringValue(value) : String(value);
}

/**
 * The strings the hidden form input carries: one per selected value with `multiple` (none when empty),
 * otherwise exactly one, which is `''` while nothing is selected.
 *
 * @param state - The Select state.
 * @returns The form values, in value order.
 */
export function selectFormValues<T>(state: SelectState<T>): readonly string[] {
  if (state.multiple) return selectedValues(state).map((value) => valueToFormString(state, value));
  return [isSelectEmpty(state) ? '' : valueToFormString(state, selectedValues(state)[0] as T)];
}

/** The text an option is found by: its `text`, else its label. */
function itemText<T>(state: SelectState<T>, item: SelectItem<T>): string {
  return item.text?.trim() ? item.text : itemLabel(state, item);
}

/**
 * Whether the query shows the option: always without `filter` or with an empty query, otherwise when the text of
 * the option contains the trimmed query, ignoring case.
 *
 * @param state - The Select state.
 * @param item - The option.
 * @returns `true` while the option is shown.
 */
export function isSelectItemVisible<T>(state: SelectState<T>, item: SelectItem<T>): boolean {
  const query = state.filter === true ? (state.query ?? '').trim().toLowerCase() : '';
  return query === '' || itemText(state, item).toLowerCase().includes(query);
}

/** The options the query shows, in document order: every option without `filter`. */
export function visibleSelectItems<T>(state: SelectState<T>): readonly SelectItem<T>[] {
  return state.items.filter((item) => isSelectItemVisible(state, item));
}

/** The items as typeahead items: the option text, else its label. An option the query hides is disabled. */
export function toTypeaheadItems<T>(state: SelectState<T>): TypeaheadItem[] {
  return state.items.map((item) => ({
    disabled: item.disabled === true || !isSelectItemVisible(state, item),
    text: itemText(state, item),
  }));
}

/** The index of the first selected option, or `-1`. */
export function selectedIndex<T>(state: SelectState<T>): number {
  return state.items.findIndex((item: SelectItem<T>) => isValueSelected(state, item.value));
}
