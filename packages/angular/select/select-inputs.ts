import { Directive, booleanAttribute, input, model } from '@angular/core';
import { CckFormControlBase } from '@cocokits/angular/form-control';
import type { OverlayAlign, OverlaySide } from '@cocokits/cdk/positioning';
import type { CckSelectItem, CckSelectOptionRef, SelectOpenChangeDetails } from './select-types';

/**
 * The inputs of `CckSelect` and its value. The class is split in three so that no file passes the size limit:
 * this one declares the API, `CckSelectState` derives the state and the props of the parts from it, and `CckSelect`
 * holds the behaviour. Not for direct use or extension.
 */
@Directive()
export abstract class CckSelectInputs<V = string> extends CckFormControlBase {
  /**
   * The selected value: an option's value for a single Select, a list of values with `multiple`. `undefined`
   * means unbound (nothing is selected) and `null` means nothing is selected. `''` shows the placeholder too. A
   * write from the parent or a forms library never emits `selectionChange`.
   * @cckSemantic select.value
   */
  readonly value = model<V | null | undefined>(undefined);

  /**
   * Whether several options can be selected. The value is then a list, and choosing an option toggles it and
   * keeps the list open.
   * @defaultValue false
   */
  readonly multiple = input(false, { transform: booleanAttribute });

  /**
   * The text shown while nothing is selected.
   * @cckSemantic select.value.placeholder
   * @defaultValue ''
   */
  readonly placeholder = input('');

  /**
   * Whether an option's value is the selected value. Use it when the options carry objects.
   * @cckSemantic select.isItemEqual
   * @defaultValue Object.is
   * @see https://github.com/angular/components/blob/main/src/material/select/select.ts MatSelect.compareWith
   */
  readonly compareWith = input<(o1: CckSelectItem<V>, o2: CckSelectItem<V>) => boolean>((a, b) => Object.is(a, b));

  /**
   * Turns a value into the string the hidden form input submits, and matches an autofilled string to an option.
   * @cckSemantic select.itemToStringValue
   * @defaultValue String
   */
  readonly itemToStringValue = input<(value: CckSelectItem<V>) => string>((value) => String(value));

  /**
   * Orders the values of a `multiple` Select after a choice. Without it they follow the order of the options.
   * @cckSemantic none
   * @remarks Angular only: React and Vue keep the selection order.
   * @see https://github.com/angular/components/blob/main/src/material/select/select.ts MatSelect.sortComparator
   */
  readonly sortComparator = input<
    ((a: CckSelectOptionRef, b: CckSelectOptionRef, options: readonly CckSelectOptionRef[]) => number) | undefined
  >(undefined);

  /**
   * How long a pause empties the type-to-find buffer, in milliseconds. A character is matched at once.
   * @cckSemantic none
   * @remarks Angular only: React and Vue use 500 ms.
   * @defaultValue 500
   */
  readonly typeaheadDebounceInterval = input<number | undefined>(undefined);

  /**
   * Whether an option whose value is `null` or `undefined` is selected like any other instead of clearing a
   * single Select; it then shows its label.
   * @cckSemantic none
   * @remarks Angular only: a `null` item always clears in React and Vue.
   * @defaultValue false
   */
  readonly canSelectNullableOptions = input<boolean | undefined, unknown>(undefined, {
    transform: (value) => (value === undefined ? undefined : booleanAttribute(value)),
  });

  /**
   * Whether Escape and an outside press keep the list open. The check runs first, before `closePredicate`.
   * Choosing an option, the trigger, `close()` and focus leaving still close it. Disabling these closes weakens
   * the pattern: a keyboard user can no longer leave with Escape.
   * @defaultValue false
   * @remarks Angular only: React refuses with `onEscapeKeyDown` and `onPointerDownOutside`, Vue with the matching events.
   * @cckSemantic none
   * @see https://github.com/angular/components/blob/main/src/cdk/overlay/overlay-directives.ts cdkConnectedOverlayDisableClose
   */
  readonly disableClose = input(false, { transform: booleanAttribute });

  /**
   * Decides, for every close the Select makes itself (the trigger, Escape, an outside press, choosing an
   * option), whether it happens: `false` keeps the list open. It runs after `disableClose`. A value chosen in
   * the list still changes. `open()`, `close()`, `toggle()` and focus leaving are never checked: focus leaving
   * chooses the highlighted option and closes. Refusing Escape weakens the pattern.
   * @remarks Angular only: React refuses with `details.cancel()` in `onOpenChange`, Vue by controlling `open`.
   * @cckSemantic none
   * @see https://github.com/angular/components/blob/main/src/material/dialog/dialog-config.ts MatDialogConfig.closePredicate
   */
  readonly closePredicate = input<((details: SelectOpenChangeDetails) => boolean) | undefined>(undefined);

  /**
   * The native `autocomplete` of the hidden form inputs, for the browser's autofill.
   * @cckSemantic select.autocomplete
   * @defaultValue 'off'
   */
  readonly autocomplete = input<string | undefined>(undefined);

  /**
   * The ids this control is described by (`aria-describedby`), kept off the host and given to the trigger.
   * @cckSemantic select.trigger.aria-describedby
   */
  override readonly ariaDescribedBy = input<string | undefined>(undefined, { alias: 'aria-describedby' });

  /**
   * The `name` that `FormData` submits. Signal Forms writes its field name into it. Left out, it is the path of
   * the bound forms control joined with `.`, and none without a forms library. Without a name and without
   * `required` no hidden input renders.
   * @cckSemantic select.name
   * @defaultValue ''
   */
  override readonly name = input('');

  /**
   * The id of the form the hidden inputs belong to (native `form`), for a Select outside its form.
   */
  readonly form = input<string | undefined>(undefined);

  /**
   * The side of the trigger (or the field box) the list prefers. `start` and `end` follow the direction; it
   * flips when there is no room.
   * @cckSemantic select.content.side
   * @defaultValue 'bottom'
   */
  readonly side = input<OverlaySide>('bottom');

  /**
   * How the list lines up along the anchor's edge.
   * @cckSemantic select.content.align
   * @defaultValue 'start'
   */
  readonly align = input<OverlayAlign>('start');

  /**
   * The author's label, kept off the host and given to the trigger and the list.
   * @cckSemantic select.trigger.aria-label
   */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  /**
   * The ids of the elements that label the Select, kept off the host and given to the trigger and the list.
   * @cckSemantic select.trigger.aria-labelledby
   */
  readonly ariaLabelledBy = input<string | undefined>(undefined, { alias: 'aria-labelledby' });

  /**
   * Whether the user left the control. Signal Forms writes it; a value that is given wins, otherwise it is set
   * after the first blur.
   * @cckSemantic none
   * @remarks Signal Forms' input; the React and Vue Select take no such prop.
   */
  override readonly touched = input(false, { transform: booleanAttribute });

  /**
   * Whether the user changed the control. Signal Forms writes it; a value that is given wins, otherwise it is
   * set after the first change.
   * @cckSemantic none
   * @remarks Signal Forms' input; the React and Vue Select take no such prop.
   */
  override readonly dirty = input(false, { transform: booleanAttribute });

  /**
   * Whether a submit of the owner form was attempted. A value that is given wins, also `false`; otherwise a
   * `submit` event of the form sets it and a reset clears it.
   * @cckSemantic none
   * @remarks Signal Forms' input; the React and Vue Select take no such prop.
   */
  override readonly submitted = input<boolean | undefined, unknown>(undefined, {
    transform: (value) => (value === undefined ? undefined : booleanAttribute(value)),
  });

  /**
   * Whether an asynchronous validator is running.
   * @cckSemantic none
   * @remarks Signal Forms' input; the React and Vue Select take no such prop.
   * @defaultValue false
   */
  override readonly pending = input(false, { transform: booleanAttribute });
}
