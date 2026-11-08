import { InjectionToken, type Signal } from '@angular/core';
import type { SelectOpenReason, SelectValueReason } from '@cocokits/machines/select';
import type { ChangeDetails } from '@cocokits/shared';

/**
 * Why the open state of a Select changed. It is one of five values.
 *
 * `'trigger'`: the user pressed the trigger. `'escape'`: the user pressed Escape. `'outside-press'`: the user pressed outside the list. `'select'`: the user chose an option. `'blur'`: the focus left the trigger.
 */
export type SelectOpenChangeReason = SelectOpenReason;

/**
 * What `closePredicate` receives: an object with the `reason` why the Select is about to close, and the `event` behind it.
 */
export type SelectOpenChangeDetails = ChangeDetails<SelectOpenChangeReason>;

/**
 * Why the value of a Select changed. It is one of two values.
 *
 * `'user'`: the user chose an option. `'form-reset'`: the form was reset.
 */
export type SelectValueChangeReason = SelectValueReason;

/**
 * The type of the value of one option. For a single Select it is `V`. For a Select with `multiple`, it is the type of one item of the list.
 *
 * @typeParam V - The type of the value of the Select.
 */
export type CckSelectItem<V> = V extends readonly (infer Item)[] ? Item : V;

/**
 * What `sortComparator` receives for an option: the signals of the option. A `CckSelectOption` has the same members.
 */
export interface CckSelectOptionRef {
  /** The option's value. */
  readonly value: Signal<unknown>;
  /** The option's `id`, if it has one. */
  readonly id: Signal<string | undefined>;
  /** Whether the option itself is disabled. */
  readonly disabled: Signal<boolean>;
}

/**
 * What the `cckSelectTrigger` template receives: the selected values, as `selected`.
 *
 * @typeParam T - The type of the value of one option. When not set, it is `string`.
 */
export interface SelectTriggerContext<T = string> {
  /**
   * The values that are selected, as a list. A single Select gives a list of one value.
   */
  readonly selected: readonly T[];
}

/** What an option tells the Select about itself. @internal */
export interface SelectOptionRegistration {
  /** The registration key, never derived from the value. */
  readonly key: string;
  /** The option element. */
  readonly element: HTMLElement;
  /** The option itself, for `sortComparator`. */
  readonly option: CckSelectOptionRef;
  /** The option's value. */
  readonly value: Signal<unknown>;
  /** The option's own `id`, if it has one. */
  readonly id: Signal<string | undefined>;
  /** Whether the option, or its group, is disabled. */
  readonly disabled: Signal<boolean>;
  /** The trimmed text of the option's content, read from the document. */
  readonly label: () => string;
}

/**
 * The default values of every Select below the provider. Set them with `CCK_SELECT_CONFIG`.
 */
export interface CckSelectConfig {
  /**
   * How long a pause, in milliseconds, empties the type-to-find text. When not set, the pause is 500 milliseconds.
   * @defaultValue 500
   */
  typeaheadDebounceInterval?: number;
  /**
   * Whether an option with the value `null` or `undefined` is chosen like any other option. When not set, such an option clears a single Select.
   * @defaultValue false
   */
  canSelectNullableOptions?: boolean;
}

/**
 * The default values for every Select below the provider. A value here replaces the built-in default. An input on a Select wins over it.
 * @example
 * @Component({
 *   providers: [{ provide: CCK_SELECT_CONFIG, useValue: { typeaheadDebounceInterval: 300 } }],
 * })
 * export class DishForm {}
 */
export const CCK_SELECT_CONFIG = new InjectionToken<CckSelectConfig>('CCK_SELECT_CONFIG');
