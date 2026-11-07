import { InjectionToken, type Signal } from '@angular/core';
import type { SelectOpenReason, SelectValueReason } from '@cocokits/machines/select';
import type { ChangeDetails } from '@cocokits/shared';

/** Why the open state of a Select changed. */
export type SelectOpenChangeReason = SelectOpenReason;

/** What `closePredicate` of a Select receives: why the Select is about to close and the event behind it. */
export type SelectOpenChangeDetails = ChangeDetails<SelectOpenChangeReason>;

/** Why the value of a Select changed: the user chose an option (`'user'`) or the form was reset (`'form-reset'`). */
export type SelectValueChangeReason = SelectValueReason;

/** The type of one option's value: `V` for a single Select, the item type of the list for a multiple one. */
export type CckSelectItem<V> = V extends readonly (infer Item)[] ? Item : V;

/** What `sortComparator` is given of an option: its signals. A `CckSelectOption` is one. */
export interface CckSelectOptionRef {
  /** The option's value. */
  readonly value: Signal<unknown>;
  /** The option's `id`, if it has one. */
  readonly id: Signal<string | undefined>;
  /** Whether the option itself is disabled. */
  readonly disabled: Signal<boolean>;
}

/** What the `cckSelectTrigger` template receives. */
export interface SelectTriggerContext<T = string> {
  /** The selected values; empty while nothing is selected. */
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

/** The defaults of every Select below the provider. */
export interface CckSelectConfig {
  /** How long a pause empties the type-to-find buffer, in milliseconds. @defaultValue 500 */
  typeaheadDebounceInterval?: number;
  /** Whether an option with a `null` or `undefined` value is selected like any other. @defaultValue false */
  canSelectNullableOptions?: boolean;
}

/**
 * Sets the defaults of the Selects below the provider. A provided value replaces the built-in defaults, and an
 * input on the Select wins.
 *
 * @example
 * providers: [{ provide: CCK_SELECT_CONFIG, useValue: { typeaheadDebounceInterval: 300 } }]
 * @see https://github.com/angular/components/blob/main/src/material/select/select.ts MAT_SELECT_CONFIG
 */
export const CCK_SELECT_CONFIG = new InjectionToken<CckSelectConfig>('CCK_SELECT_CONFIG');
