import { booleanAttribute, Directive, input } from '@angular/core';
import { CckFormControlBase } from '@cocokits/angular/form-control';
import type { OverlayAlign, OverlaySide } from '@cocokits/cdk/positioning';
import type { CckSelectItem, CckSelectOptionRef } from './select-types';

/**
 * The inputs of the Select that set how it chooses, sorts, searches and places its list. `CckSelect` extends it
 * and adds the value, the trigger and the list.
 *
 * Not for direct use or extension outside CocoKits: it is exported only so that the Select is one entry point.
 * @internal
 */
@Directive({
  host: {
    '[attr.side]': 'null',
    '[attr.align]': 'null',
    '[attr.comparewith]': 'null',
    '[attr.itemtostringvalue]': 'null',
    '[attr.sortcomparator]': 'null',
    '[attr.typeaheaddebounceinterval]': 'null',
    '[attr.canselectnullableoptions]': 'null',
    '[attr.filter]': 'null',
    '[attr.searchlabel]': 'null',
  },
})
export abstract class CckSelectInputs<V> extends CckFormControlBase {
  /**
   * A function that tells whether an option value is the selected value. Use it when the option values are objects. When not set, the values are compared with `Object.is`.
   * @remarks Pair it with `itemToStringValue`, which turns an object into the text that a form sends.
   * @example
   * <cck-select [(value)]="dish" [compareWith]="sameDish" [itemToStringValue]="dishId" aria-label="Dish">
   *   @for (item of dishes; track item.id) {
   *     <cck-select-option [value]="item">{{ item.name }}</cck-select-option>
   *   }
   * </cck-select>
   * <!-- In the class: sameDish = (a: Dish, b: Dish) => a.id === b.id; dishId = (dish: Dish) => String(dish.id); -->
   * @cckSemantic select.isItemEqual
   * @defaultValue Object.is
   */
  readonly compareWith = input<(o1: CckSelectItem<V>, o2: CckSelectItem<V>) => boolean>((a, b) => Object.is(a, b));

  /**
   * A function that turns a value into the text that the hidden form input sends. The browser autofill uses it to find the option. When not set, the value is turned into text with `String`.
   * @cckSemantic select.itemToStringValue
   * @defaultValue String
   */
  readonly itemToStringValue = input<(value: CckSelectItem<V>) => string>((value) => String(value));

  /**
   * A function that sorts the values of a `multiple` Select after each choice. When not set, the values follow the order of the options.
   * @cckSemantic none
   * @cckParity Only this framework has this member.
   */
  readonly sortComparator = input<
    ((a: CckSelectOptionRef, b: CckSelectOptionRef, options: readonly CckSelectOptionRef[]) => number) | undefined
  >(undefined);

  /**
   * How long a pause, in milliseconds, empties the type-to-find text. When not set, the pause is 500 milliseconds. A letter is matched at once.
   * @cckSemantic none
   * @cckParity Only this framework has this member.
   * @defaultValue 500
   */
  readonly typeaheadDebounceInterval = input<number | undefined>(undefined);

  /**
   * Whether an option with the value `null` or `undefined` is chosen like any other option. When not set, such an option clears a single Select.
   * @cckSemantic none
   * @cckParity Only this framework has this member.
   * @defaultValue false
   */
  readonly canSelectNullableOptions = input<boolean | undefined, unknown>(undefined, {
    transform: (value) => (value === undefined ? undefined : booleanAttribute(value)),
  });

  /**
   * The native `autocomplete` value of the hidden form inputs. The browser autofill uses it. When not set, the value is `'off'`.
   * @cckSemantic select.autocomplete
   * @defaultValue 'off'
   */
  readonly autocomplete = input<string | undefined>(undefined);

  /**
   * The side of the trigger where the list prefers to open. `start` and `end` follow the text direction. The list opens on the other side when there is no room.
   * @cckSemantic select.content.side
   * @defaultValue 'bottom'
   */
  readonly side = input<OverlaySide>('bottom');

  /**
   * How the list lines up with the edge of the trigger.
   * @cckSemantic select.content.align
   * @defaultValue 'start'
   */
  readonly align = input<OverlayAlign>('start');

  /**
   * Whether the list has a search. Write a `cck-select-header` with an `input[cckSelectSearch]` in it. Typing narrows the options to those whose text contains the query, without regard to case. While nothing matches, the list shows its `cck-select-empty`. The query clears when the list closes.
   * @remarks While the list is open with a search, the focus is in the search input. Down Arrow and Up Arrow move the highlight, Enter chooses it, Escape closes the list and returns the focus to the trigger. The trigger does not close the list when it loses the focus to the search.
   * @cckSemantic select.filter
   * @cckParity Not available in every framework.
   * @defaultValue false
   */
  readonly filter = input(false, { transform: booleanAttribute });

  /**
   * The accessible name of the search input. When not set, the name is "Search".
   * @cckSemantic select.searchLabel
   * @cckParity Not available in every framework.
   */
  readonly searchLabel = input<string | undefined>(undefined);
}
