import { sortByDomOrderOf } from '@cocokits/angular-core';
import type { SelectItem } from '@cocokits/machines/select';
import type { CckSelectOptionRef, SelectOptionRegistration } from './select-types';

/**
 * The options as machine items. The label is read from the document when it is used, because the text of an
 * option can change without a signal.
 *
 * @param options - The registered options.
 * @returns The items, in the same order.
 * @internal
 */
export function toSelectItems<T>(options: readonly SelectOptionRegistration[]): readonly SelectItem<T>[] {
  return options.map((option) => ({
    key: option.key,
    value: option.value() as T,
    disabled: option.disabled(),
    id: option.id(),
    get label() {
      return option.label();
    },
  }));
}

/**
 * The options in the order of the document. Options registered late (an `@if`, a keyed `@for`) are in creation
 * order until the list is mounted.
 *
 * @param options - The registered options.
 * @returns The same list when it is in order, otherwise the sorted list.
 * @internal
 */
export function sortOptionsByDom(options: readonly SelectOptionRegistration[]): readonly SelectOptionRegistration[] {
  const sorted = sortByDomOrderOf(options, (option) => option.element);
  return sorted.some((option, index) => option !== options[index]) ? sorted : options;
}

/**
 * Puts the values of a multiple Select in option order, or in the order of `sortComparator`. A value no option
 * has stays after the others, in the order it came.
 *
 * @param values - The values after a toggle.
 * @param options - The registered options in document order.
 * @param equal - `compareWith`.
 * @param comparator - `sortComparator`, if any.
 * @returns The ordered values.
 * @internal
 */
export function sortSelectValues<T>(
  values: readonly T[],
  options: readonly SelectOptionRegistration[],
  equal: (a: T, b: T) => boolean,
  comparator:
    ((a: CckSelectOptionRef, b: CckSelectOptionRef, list: readonly CckSelectOptionRef[]) => number) | undefined,
): readonly T[] {
  const list = options.map((option) => option.option);
  const rank = (index: number): number => (index < 0 ? Number.MAX_SAFE_INTEGER : index);
  return values
    .map((value) => {
      const index = options.findIndex((option) => equal(option.value() as T, value));
      return { value, index, option: index < 0 ? undefined : options.at(index) };
    })
    .sort((a, b) => {
      if (comparator && a.option && b.option) return comparator(a.option.option, b.option.option, list);
      return rank(a.index) - rank(b.index);
    })
    .map((entry) => entry.value);
}

/**
 * Whether a close is refused, by the order the options give: `disableClose` stops Escape and an outside press,
 * then `closePredicate` decides. Focus leaving the trigger is never refused.
 *
 * @param reason - Why the list closes.
 * @param disableClose - The `disableClose` input.
 * @param ask - Calls `closePredicate`.
 * @returns Whether the close may happen.
 * @internal
 */
export function mayClose(reason: string, disableClose: boolean, ask: () => boolean): boolean {
  if (reason === 'blur') return true;
  if (disableClose && (reason === 'escape' || reason === 'outside-press')) return false;
  return ask();
}
