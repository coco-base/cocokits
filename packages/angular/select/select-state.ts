import { computed, inject, linkedSignal, signal, type Signal, type WritableSignal } from '@angular/core';
import { IdGenerator } from '@cocokits/angular-core';
import { hiddenInputEntries } from '@cocokits/angular/form-control';
import type { OverlayAlign, OverlaySide } from '@cocokits/cdk/positioning';
import { createTypeahead } from '@cocokits/cdk/roving-focus';
import type { FormFieldControlContext, FormFieldControlProps } from '@cocokits/machines/form-field';
import {
  getSelectPreviewValues,
  getSelectProps,
  getSelectValueText,
  isSelectEmpty,
  resolveSelectHighlight,
  selectAnatomy,
  type SelectEvent,
  type SelectItem,
  type SelectParts,
  type SelectState,
} from '@cocokits/machines/select';
import { sortSelectValues, toSelectItems } from './select-helpers';
import {
  CCK_SELECT_CONFIG,
  type CckSelectItem,
  type CckSelectOptionRef,
  type SelectOptionRegistration,
  type SelectTriggerContext,
} from './select-types';

/** What {@link createSelectState} reads from the Select: its inputs and the facts of its form control. @internal */
export interface SelectStateInputs<V> {
  readonly value: Signal<V | null | undefined>;
  readonly multiple: Signal<boolean>;
  readonly compareWith: Signal<(o1: CckSelectItem<V>, o2: CckSelectItem<V>) => boolean>;
  readonly itemToStringValue: Signal<(value: CckSelectItem<V>) => string>;
  readonly sortComparator: Signal<
    ((a: CckSelectOptionRef, b: CckSelectOptionRef, options: readonly CckSelectOptionRef[]) => number) | undefined
  >;
  readonly typeaheadDebounceInterval: Signal<number | undefined>;
  readonly canSelectNullableOptions: Signal<boolean | undefined>;
  readonly ariaLabel: Signal<string | undefined>;
  readonly ariaLabelledBy: Signal<string | undefined>;
  readonly side: Signal<OverlaySide>;
  readonly align: Signal<OverlayAlign>;
  /** The facts every form control tracks: disabled, read-only, required, touched and so on. */
  readonly facts: Signal<Omit<FormFieldControlProps, 'id' | 'filled'>>;
  readonly fieldContext: Signal<FormFieldControlContext | undefined>;
  /** The registered options, in registration order. */
  readonly options: Signal<readonly SelectOptionRegistration[]>;
  /** Applies a machine event; false when it took no effect. */
  readonly send: (event: SelectEvent) => boolean;
}

/** What {@link createSelectState} gives the Select. @internal */
export interface SelectStateController<V> {
  /** Whether the Select reacts to the user: not disabled and not read-only, by itself or by its field. */
  readonly interactive: Signal<boolean>;
  readonly openState: WritableSignal<boolean>;
  readonly isOpen: Signal<boolean>;
  /** Whether the content is in the document: open, or closed with an exit animation still running. */
  readonly mounted: WritableSignal<boolean>;
  /** The side and align the positioning module settled on. */
  readonly placement: WritableSignal<{ side: OverlaySide; align: OverlayAlign } | null>;
  /** Bumped when the text of an option changed: the labels are read from the document, not from a signal. */
  readonly labelVersion: WritableSignal<number>;
  /** The key of the highlighted option. The highlight starts on the selected option, else the first enabled. */
  readonly highlighted: WritableSignal<string | undefined>;
  /**
   * Whether a submit was blocked because the Select is required and empty. It marks the trigger and the root
   * invalid and describes the trigger by the browser's message, because the focus move to the trigger hides
   * the native bubble. The next value change and a form reset clear it.
   */
  readonly blockedSubmit: WritableSignal<boolean>;
  /** The state without the highlight: what the start of the highlight is worked out from. */
  readonly baseState: Signal<SelectState<CckSelectItem<V>>>;
  readonly state: Signal<SelectState<CckSelectItem<V>>>;
  readonly typeahead: Signal<ReturnType<typeof createTypeahead>>;
  /** The props of every part. */
  readonly parts: Signal<SelectParts<CckSelectItem<V>>>;
  /** Whether nothing is selected: the placeholder shows. */
  readonly empty: Signal<boolean>;
  /** The text of the trigger when there is no `cckSelectTrigger` template: the labels of the selection. */
  readonly text: Signal<string>;
  readonly triggerContext: Signal<SelectTriggerContext<CckSelectItem<V>>>;
  /** The values the hidden inputs carry, one input each; none while no `name` is set. */
  readonly formInputs: Signal<readonly string[]>;
}

/**
 * The state of a Select worked out from its inputs: open, mounted and highlight state, the machine state, the
 * props of every part and what the trigger and the hidden inputs show. Call it in an injection context, after
 * the inputs are declared.
 *
 * @param inputs - The inputs of the Select and the callback that applies a machine event.
 * @returns The signals the Select and its template read.
 * @internal
 */
export function createSelectState<V>(inputs: SelectStateInputs<V>): SelectStateController<V> {
  const selectId = inject(IdGenerator).getId(selectAnatomy.classes.root);
  const config = inject(CCK_SELECT_CONFIG, { optional: true });
  const typeahead = computed(() =>
    createTypeahead({ timeoutMs: inputs.typeaheadDebounceInterval() ?? config?.typeaheadDebounceInterval }),
  );
  const openState = signal(false);
  const mounted = signal(false);
  const placement = signal<{ side: OverlaySide; align: OverlayAlign } | null>(null);
  const labelVersion = signal(0);

  const interactive = computed(() => {
    const field = inputs.fieldContext()?.state;
    const facts = inputs.facts();
    return ![facts.disabled, facts.readOnly, field?.disabled, field?.readOnly].some(Boolean);
  });
  const isOpen = computed(() => openState() && interactive());
  const items = computed<readonly SelectItem<CckSelectItem<V>>[]>(() => {
    labelVersion();
    return toSelectItems<CckSelectItem<V>>(inputs.options());
  });
  const blockedSubmit = linkedSignal<unknown, boolean>({ source: inputs.value, computation: () => false });

  const baseState = computed<SelectState<CckSelectItem<V>>>(() => ({
    ...inputs.facts(),
    blockedSubmit: blockedSubmit(),
    id: selectId,
    open: isOpen(),
    mounted: mounted(),
    items: items(),
    value: inputs.value() as CckSelectItem<V> | readonly CckSelectItem<V>[] | null | undefined,
    multiple: inputs.multiple(),
    itemToStringValue: inputs.itemToStringValue(),
    canSelectNullableOptions: inputs.canSelectNullableOptions() ?? config?.canSelectNullableOptions ?? false,
    orderValues: (values) => sortSelectValues(values, inputs.options(), inputs.compareWith(), inputs.sortComparator()),
    isItemEqual: inputs.compareWith(),
    labelledBy: inputs.ariaLabelledBy(),
    ariaLabel: inputs.ariaLabel(),
    side: placement()?.side ?? inputs.side(),
    align: placement()?.align ?? inputs.align(),
    typeahead: typeahead(),
  }));

  const highlighted = linkedSignal<boolean, string | undefined>({
    source: isOpen,
    computation: (open, previous) =>
      open ? (previous?.value ?? resolveSelectHighlight(baseState(), 'selected') ?? undefined) : undefined,
  });

  const state = computed<SelectState<CckSelectItem<V>>>(() => ({ ...baseState(), highlighted: highlighted() }));
  const parts = computed(() =>
    getSelectProps(
      state(),
      (event) => {
        inputs.send(event);
      },
      inputs.fieldContext(),
    ),
  );

  return {
    interactive,
    openState,
    isOpen,
    mounted,
    placement,
    labelVersion,
    highlighted,
    blockedSubmit,
    baseState,
    state,
    typeahead,
    parts,
    empty: computed(() => isSelectEmpty(state())),
    text: computed(() => getSelectValueText(state())),
    triggerContext: computed(() => ({ selected: getSelectPreviewValues(state()) })),
    formInputs: computed<readonly string[]>(() => hiddenInputEntries(parts().formInput, inputs.multiple())),
  };
}
