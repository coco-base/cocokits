import {
  DestroyRef,
  afterEveryRender,
  afterNextRender,
  afterRenderEffect,
  inject,
  signal,
  untracked,
  type ElementRef,
  type Signal,
  type TemplateRef,
  type WritableSignal,
} from '@angular/core';
import { CckDirection, CckOverlayLayer, CckPortal, injectZoneBoundary } from '@cocokits/angular-core';
import { deepActiveElement } from '@cocokits/cdk/focus';
import { trackLabelActivation, type LabelActivation } from '@cocokits/cdk/form-control';
import {
  transitionSelect,
  valueToFormString,
  type SelectEvent,
  type SelectTransition,
} from '@cocokits/machines/select';
import { hasAccessibleName } from '@cocokits/utils';
import { mayClose, sortOptionsByDom } from './select-helpers';
import { createSelectOverlay } from './select-overlay';
import { createSelectState, type SelectStateController, type SelectStateInputs } from './select-state';
import type {
  CckSelectItem,
  SelectOpenChangeDetails,
  SelectOpenChangeReason,
  SelectOptionRegistration,
  SelectValueChangeReason,
} from './select-types';

/** What {@link createSelectController} reads from the Select. @internal */
export interface SelectControllerOptions<V> extends Omit<SelectStateInputs<V>, 'send'> {
  /** The value model: the controller writes the value the user chose. */
  readonly value: WritableSignal<V | null | undefined>;
  /** The registered options: the controller puts them in document order. */
  readonly options: WritableSignal<readonly SelectOptionRegistration[]>;
  /** The dirty fact of the form control. */
  readonly dirty: WritableSignal<boolean>;
  readonly disableClose: Signal<boolean>;
  readonly closePredicate: Signal<((details: SelectOpenChangeDetails) => boolean) | undefined>;
  readonly trigger: Signal<ElementRef<HTMLButtonElement> | undefined>;
  readonly listbox: Signal<TemplateRef<void> | undefined>;
  readonly hiddenInputs: Signal<readonly ElementRef<HTMLInputElement>[]>;
  readonly content: Signal<HTMLElement | null>;
  readonly fieldAnchor: Signal<HTMLElement | null>;
  /** Writes `selectionChange`. */
  readonly emitChange: (value: V | null, reason: SelectValueChangeReason, event: Event | null) => void;
  /** Writes `openedChange` and `opened` or `closed`. */
  readonly emitOpen: (open: boolean) => void;
  /** Reports that the user left the control. */
  readonly onBlur: () => void;
}

/** What {@link createSelectController} gives the Select and its template. @internal */
export interface SelectController<V> extends SelectStateController<V> {
  /** The text of the validation message of a blocked submit. */
  readonly validationMessage: Signal<string>;
  readonly open: () => void;
  readonly close: () => void;
  readonly toggle: () => void;
  readonly restoreMount: (event: Event) => void;
  readonly onTriggerClick: (event: MouseEvent) => void;
  readonly onTriggerKeyDown: (event: KeyboardEvent) => void;
  readonly onTriggerBlur: (event: FocusEvent) => void;
  readonly onInvalid: (event: Event) => void;
  readonly onAutofill: (event: Event, current: string) => void;
}

/**
 * The behaviour of a Select: its state, the overlay lifecycle, the machine transitions that write the value and
 * the open state, the trigger handlers and the sync with the document. Call it in an injection context, after
 * the inputs are declared.
 *
 * @param o - The inputs of the Select and the callbacks that write its outputs.
 * @returns The state signals and the handlers the template uses.
 * @internal
 */
export function createSelectController<V>(o: SelectControllerOptions<V>): SelectController<V> {
  const portal = inject(CckPortal);
  const layer = inject(CckOverlayLayer);
  const model = createSelectState<V>({ ...o, send: (event) => send(event) });
  const validationMessage = signal('');
  const revealTick = signal(0);
  let labelActivation: LabelActivation | undefined;
  let mountValue: V | null | undefined;
  let labelSnapshot = '';

  const overlay = createSelectOverlay({
    isOpen: model.isOpen,
    mounted: model.mounted,
    setMounted: (mounted) => {
      model.mounted.set(mounted);
    },
    trigger: o.trigger,
    listbox: o.listbox,
    content: o.content,
    fieldAnchor: o.fieldAnchor,
    side: o.side,
    align: o.align,
    setPlacement: (placement) => {
      model.placement.set(placement);
    },
    send: (event) => send(event),
    portal,
    zone: injectZoneBoundary(),
    direction: inject(CckDirection),
    layer,
    parentLayer: inject(CckOverlayLayer, { optional: true, skipSelf: true }),
  });

  inject(DestroyRef).onDestroy(() => {
    overlay.destroy();
    labelActivation?.destroy();
    model.typeahead().reset();
  });

  afterNextRender(() => {
    mountValue = o.value();
    const trigger = o.trigger()?.nativeElement;
    if (trigger) labelActivation = trackLabelActivation(trigger);
    if (trigger && (typeof ngDevMode === 'undefined' || ngDevMode) && !hasAccessibleName(trigger)) {
      console.warn(
        'CocoKits: a Select has no accessible name. Add a <label cckLabel> to its FormField, ' +
          'or an aria-label or aria-labelledby to the <cck-select>.',
      );
    }
  });

  // The browser's autofill makes the `value` of a hidden input its own: the attribute no longer shows it.
  afterRenderEffect({
    write: () => {
      const entries = model.formInputs();
      o.hiddenInputs().forEach((input, index) => {
        const entry = entries.at(index);
        if (entry !== undefined && input.nativeElement.value !== entry) input.nativeElement.value = entry;
      });
    },
  });

  // The highlighted option scrolls into view at the nearest edge after a keyboard move or an open.
  afterRenderEffect({
    write: () => {
      const [tick, mounted] = [revealTick(), model.mounted()];
      if (tick === 0 || !mounted) return;
      untracked(() => {
        const key = model.highlighted();
        o.options()
          .find((option) => option.key === key)
          ?.element.scrollIntoView({ block: 'nearest' });
      });
    },
  });

  // Options registered late (an `@if`, a keyed `@for`) are in creation order; in the document they have an order.
  // The text of an option is read from the document, so a change of it asks for a new render of the labels.
  afterEveryRender({
    read: () => {
      const current = untracked(o.options);
      const snapshot = current.map((option) => option.label()).join('\u0000');
      if (snapshot !== labelSnapshot) {
        labelSnapshot = snapshot;
        model.labelVersion.update((version) => version + 1);
      }
      if (!model.mounted()) return;
      const sorted = sortOptionsByDom(current);
      if (sorted !== current) o.options.set(sorted);
    },
  });

  /** Whether the user's close may happen: `disableClose` for Escape and a press, then `closePredicate`. */
  function allowClose(reason: SelectOpenChangeReason, event: Event | null): boolean {
    return mayClose(reason, o.disableClose(), () => o.closePredicate()?.({ reason, event }) !== false);
  }

  /** Writes a value the user chose and tells the parent. */
  function commit(value: unknown, event: Event | null): void {
    o.value.set(value as V | null);
    o.dirty.set(true);
    o.emitChange(value as V | null, 'user', event);
  }

  /** Changes the open state and tells the parent, for a user event and for `open()`, `close()` and `toggle()`. */
  function setOpen(open: boolean): void {
    model.openState.set(open);
    if (open && model.isOpen()) overlay.startDismissLayer();
    else overlay.stopDismissLayer();
    o.emitOpen(open);
  }

  /** Applies the highlight and the open change of a transition. */
  function applyOpen(next: SelectTransition<CckSelectItem<V>>): void {
    if (next.highlight !== undefined) model.highlighted.set(next.highlight ?? undefined);
    if (next.open) setOpen(next.open.open);
  }

  /**
   * Applies an event: the close is asked of `disableClose` and `closePredicate` first, then the value is written
   * and the open state changes. A refused close in the list (`select`) still writes the value.
   *
   * @param event - What happened.
   * @returns Whether the event took effect, so that a refused Escape stays with the layer.
   */
  function send(event: SelectEvent): boolean {
    const next = transitionSelect(model.state(), event);
    if (!next) return false;
    const closing = next.open && !next.open.open ? next.open.reason : undefined;
    const refused = closing !== undefined && !allowClose(closing, event.event);
    // Only a choice in the list keeps its value when the close is refused.
    if (refused && closing !== 'select') return false;
    if (!refused) applyOpen(next);
    if (next.reveal) revealTick.update((tick) => tick + 1);
    if (next.value !== undefined) commit(next.value, event.event);
    return !refused;
  }

  function open(): void {
    if (model.openState() || !model.interactive()) return;
    setOpen(true);
  }

  function close(): void {
    if (model.openState()) setOpen(false);
  }

  return {
    ...model,
    validationMessage,
    open,
    close,
    toggle: () => {
      if (model.openState()) close();
      else open();
    },
    restoreMount: (event) => {
      const value = (mountValue ?? (o.multiple() ? [] : null)) as V | null;
      o.value.set(value);
      model.blockedSubmit.set(false);
      o.emitChange(value, 'form-reset', event);
    },
    onTriggerClick: (event) => {
      // A click on the label of a field forwards a click to the trigger: it takes the focus and does not open.
      if (labelActivation?.consume()) {
        o.trigger()?.nativeElement.focus();
        return;
      }
      // A press that did not focus the trigger (Safari never does; Firefox when it moves focus into a frame) must
      // not open the list with the focus elsewhere: the keys and `aria-activedescendant` belong to the trigger.
      const button = o.trigger()?.nativeElement;
      const { disabled, 'aria-readonly': readonly } = model.parts().trigger;
      if (button && !disabled && !readonly && deepActiveElement(button.ownerDocument) !== button) {
        button.focus({ preventScroll: true });
      }
      model.parts().trigger.onClick(event);
    },
    onTriggerKeyDown: (event) => {
      // The dismiss layer answers Escape while the list is open, so that one intent reaches the refusals.
      if (event.key === 'Escape' && model.isOpen() && overlay.hasDismissLayer()) return;
      model.parts().trigger.onKeyDown(event);
    },
    onTriggerBlur: (event) => {
      // A press outside is being decided: the focus move it causes must not close the list on its own.
      if (!overlay.focusOutHeld()) model.parts().trigger.onBlur(event);
      model.typeahead().reset();
      o.onBlur();
    },
    /**
     * An invalid hidden input (a required, empty Select) sends the focus to the trigger. The event must not be
     * canceled (a canceled `invalid` lets the submit go on), and the browser focuses the invalid input right
     * after the event, so the trigger takes the focus back in the next task.
     */
    onInvalid: (event) => {
      validationMessage.set((event.target as HTMLInputElement).validationMessage);
      model.blockedSubmit.set(true);
      o.trigger()?.nativeElement.focus();
      setTimeout(() => {
        o.trigger()?.nativeElement.focus();
      }, 0);
    },
    /**
     * The browser wrote into a hidden input (autofill). A single Select chooses the enabled option whose form
     * string equals the write; any other write is undone, and a multiple Select ignores it.
     */
    onAutofill: (event, current) => {
      const input = event.target as HTMLInputElement;
      const state = model.baseState();
      const match =
        o.multiple() || !model.interactive()
          ? undefined
          : o.options().find((option) => {
              const value = option.value() as CckSelectItem<V> | null | undefined;
              return !option.disabled() && value != null && valueToFormString(state, value) === input.value;
            });
      if (!match) {
        input.value = current;
        return;
      }
      const value = match.value() as CckSelectItem<V>;
      const selected = o.value() as CckSelectItem<V> | null | undefined;
      if (selected == null || !o.compareWith()(selected, value)) commit(value, event);
    },
  };
}
