import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  ViewContainerRef,
  ViewEncapsulation,
  afterEveryRender,
  afterNextRender,
  afterRenderEffect,
  forwardRef,
  inject,
  output,
  signal,
  untracked,
  viewChild,
  viewChildren,
  type TemplateRef,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import {
  CckAttrs,
  CckDirection,
  CckOverlayLayer,
  CckPortal,
  injectFormParticipation,
  injectZoneBoundary,
} from '@cocokits/angular-core';
import { createTriggerDismissLayer, type DismissLayer } from '@cocokits/cdk/dismissal';
import { deepActiveElement } from '@cocokits/cdk/focus';
import { trackLabelActivation, type LabelActivation } from '@cocokits/cdk/form-control';
import { startOverlayPosition } from '@cocokits/cdk/positioning';
import { createPresence } from '@cocokits/cdk/presence';
import {
  transitionSelect,
  valueToFormString,
  type SelectEvent,
  type SelectTransition,
} from '@cocokits/machines/select';
import { hasAccessibleName, visuallyHiddenStyleText } from '@cocokits/utils';
import { CCK_SELECT_CONTENT_HOST, CckSelectContent } from './select-content';
import { sortOptionsByDom } from './select-helpers';
import { CckSelectState } from './select-state';
import { type CckSelectItem, type SelectValueChangeReason } from './select-types';

/** What `selectionChange` emits: the Select, the new value and why it changed. */
export interface CckSelectChange<V = string> {
  /** The Select that changed. */
  readonly source: CckSelect<V>;
  /** The new value: an option's value or `null` for a single Select, the list of values for a multiple one. */
  readonly value: V | null;
  /** Why the value changed. */
  readonly reason: SelectValueChangeReason;
  /** The event that caused the change. */
  readonly event: Event | null;
}

/**
 * A select: a trigger that shows the selection and a listbox of options in an overlay. It is a custom
 * listbox, not a native `<select>`. The options are the content you write, `[cckSelectOption]` and
 * `[cckSelectOptionGroup]`; the trigger, the placeholder, the value and the icon are rendered for you.
 *
 * The value is a model: `[(value)]`, `[value]` or unbound. `V` is the type of the value, taken from the binding:
 * an option's value for a single Select (`string` unless the options carry something else, and then
 * `compareWith` and `itemToStringValue` tell the Select how to compare and submit it), a list with
 * `multiple`. `undefined` means unbound and `null` means nothing is selected; the Select writes `null` when a
 * clearing option is chosen or the form is reset. In a single Select an option whose value is `null` or
 * `undefined` clears the value (unless `canSelectNullableOptions`), and one whose value is `''` clears it and shows
 * the placeholder. The trigger shows the text of the selected options, joined with `, `. The Select is a Signal
 * Forms custom control and, through the static `ngNoCva` attribute, also binds to `formControlName`,
 * `[formControl]` and `ngModel`. While `name` is set it renders hidden native inputs, so `FormData`, `required`,
 * `form`, `reset` and autofill work.
 *
 * Inside a `[cckFormField]` the trigger is the field's control (`<fieldId>-control`) and the list lines up with
 * the field's input wrapper. Name the Select with the field's label, `aria-label` or `aria-labelledby`. Focus
 * stays on the trigger while the list is open; the highlighted option is the `aria-activedescendant`.
 *
 * @example
 * <div cckSelect [(value)]="dish" placeholder="Choose a dish" aria-label="Dish">
 *   <div cckSelectOption value="Cake">Cake</div>
 *   <div cckSelectOption value="Pizza">Pizza</div>
 * </div>
 * @typeParam V - The type of the value, taken from the `value` binding. Defaults to `string`.
 * @cckPart root
 * @cckPart trigger
 * @cckPart value
 * @cckPart dropdownIcon
 * @cckPart content
 * @cckSlot default - The options and option groups.
 * @cckSlot trigger ng-template[cckSelectTrigger] - What the trigger shows while something is selected, in place of
 * the labels joined with a comma.
 */
@Component({
  selector: '[cckSelect]',
  exportAs: 'cckSelect',
  encapsulation: ViewEncapsulation.None,
  imports: [CckAttrs, CckSelectContent, NgTemplateOutlet],
  providers: [
    CckPortal,
    CckOverlayLayer,
    // The content directive in the portal template asks for the Select through a token: it cannot import this class.
    { provide: CCK_SELECT_CONTENT_HOST, useExisting: forwardRef(() => CckSelect) },
  ],
  host: {
    '[attr.aria-label]': 'null',
    '[attr.aria-labelledby]': 'null',
    '[attr.aria-describedby]': 'null',
    '[attr.autocomplete]': 'null',
    '[attr.data-state]': 'parts().root["data-state"]',
    '[attr.data-multiple]': 'parts().root["data-multiple"]',
    '[attr.data-placeholder-shown]': 'parts().root["data-placeholder-shown"]',
  },
  templateUrl: './select.html',
})
export class CckSelect<V = string> extends CckSelectState<V> implements FormValueControl<V | null | undefined> {
  /**
   * Emits after every change of the value the user makes and after a form reset, with the Select, the new value
   * (a list with `multiple`, `null` when a clearing option was chosen) and the reason. Never for a write from the
   * parent or a forms library.
   * @cckSemantic select.valueChange
   */
  readonly selectionChange = output<CckSelectChange<V>>();

  /**
   * Emits `true` or `false` after every change of the open state, including `open()`, `close()` and `toggle()`.
   * @remarks The reason of a close is in `closePredicate`; the React `onOpenChange` and Vue `update:open` carry it.
   * @cckSemantic select.openChange
   */
  readonly openedChange = output<boolean>();

  /**
   * Emits after the list opens.
   * @cckSemantic none
   * @remarks Angular only: React and Vue report an open through `onOpenChange` and `update:open`.
   */
  readonly opened = output();

  /**
   * Emits after the list closes.
   * @cckSemantic none
   * @remarks Angular only: React and Vue report a close through `onOpenChange` and `update:open`.
   */
  readonly closed = output();

  protected readonly hiddenStyle = visuallyHiddenStyleText;
  private readonly portal = inject(CckPortal);
  private readonly direction = inject(CckDirection);
  private readonly layer = inject(CckOverlayLayer);
  private readonly zone = injectZoneBoundary();
  private readonly parentLayer = inject(CckOverlayLayer, { optional: true, skipSelf: true });
  private readonly listbox = viewChild<TemplateRef<void>>('listbox');
  private readonly hiddenInputs = viewChildren<ElementRef<HTMLInputElement>>('hidden');
  private readonly revealTick = signal(0);
  private dismissal: { readonly layer: DismissLayer; readonly stop: () => void } | null = null;
  private focusOutHeld = false;
  private labelActivation: LabelActivation | undefined;
  private mountValue: V | null | undefined;
  private labelSnapshot = '';

  protected readonly participation = injectFormParticipation({
    element: () => this.triggerRef()?.nativeElement,
    getValue: () => this.triggerRef()?.nativeElement.value ?? '',
    onReset: (event) => {
      this.onNativeReset(event);
    },
  });

  private readonly presence = createPresence({
    getElement: () => this._contentElement(),
    onStateChange: (state) => {
      this.mounted.set(state !== 'unmounted');
    },
  });

  constructor() {
    super();
    this.portal.useContainer(inject(ViewContainerRef));
    inject(DestroyRef).onDestroy(() => {
      this.presence.destroy();
      this.labelActivation?.destroy();
      this.typeahead().reset();
    });

    afterNextRender(() => {
      this.mountValue = this.value();
      const trigger = this.triggerRef()?.nativeElement;
      if (trigger) this.labelActivation = trackLabelActivation(trigger);
      if (trigger && (typeof ngDevMode === 'undefined' || ngDevMode) && !hasAccessibleName(trigger)) {
        console.warn(
          'CocoKits: a Select has no accessible name. Add a <label cckLabel> to its FormField, ' +
            'or an aria-label or aria-labelledby to the element with cckSelect.',
        );
      }
    });

    // Opening mounts at once; closing waits for the exit animation (read after the closed state rendered).
    afterRenderEffect({
      write: () => {
        const show = this.isOpen() && this.listbox() !== undefined && this.triggerRef() !== undefined;
        untracked(() => {
          this.presence.setOpen(show);
        });
      },
    });

    afterRenderEffect({
      write: () => {
        const [mounted, template, trigger] = [this.mounted(), this.listbox(), this.triggerRef()?.nativeElement];
        untracked(() => {
          if (mounted && template && trigger) this.portal.attach(template, undefined, trigger);
          else this.portal.detach();
        });
      },
    });

    afterRenderEffect({
      write: (onCleanup) => {
        const [mounted, trigger, content] = [this.mounted(), this.triggerRef()?.nativeElement, this._contentElement()];
        if (!mounted || !trigger || !content) return;
        const [side, align] = [this.side(), this.align()];
        const stop = untracked(() =>
          this.zone.outside(() =>
            startOverlayPosition({
              getAnchor: () => this.fieldAnchor() ?? trigger,
              getContent: () => content,
              side,
              align,
              getDirection: () => this.direction.dir(),
              onPlacementChange: (placement) => {
                this.zone.inside(() => {
                  this.placement.set(placement);
                });
              },
            }),
          ),
        );
        onCleanup(() => {
          stop();
          this.placement.set(null);
        });
      },
    });

    afterRenderEffect({
      write: (onCleanup) => {
        const open = this.isOpen();
        // A layer started before the list rendered must not outlive a close made by the parent.
        if (!open)
          untracked(() => {
            this.stopDismissLayer();
          });
        if (!open || !this.triggerRef() || !this._contentElement()) return;
        untracked(() => {
          this.startDismissLayer();
          onCleanup(() => {
            this.stopDismissLayer();
          });
        });
      },
    });

    // The browser's autofill makes the `value` of a hidden input its own: the attribute no longer shows it.
    afterRenderEffect({
      write: () => {
        const entries = this.formInputs();
        this.hiddenInputs().forEach((input, index) => {
          const entry = entries.at(index);
          if (entry !== undefined && input.nativeElement.value !== entry) input.nativeElement.value = entry;
        });
      },
    });

    // The highlighted option scrolls into view at the nearest edge after a keyboard move or an open.
    afterRenderEffect({
      write: () => {
        const [tick, mounted] = [this.revealTick(), this.mounted()];
        if (tick === 0 || !mounted) return;
        untracked(() => {
          const key = this.highlighted();
          this._options()
            .find((option) => option.key === key)
            ?.element.scrollIntoView({ block: 'nearest' });
        });
      },
    });

    // Options registered late (an `@if`, a keyed `@for`) are in creation order; in the document they have an order.
    // The text of an option is read from the document, so a change of it asks for a new render of the labels.
    afterEveryRender({
      read: () => {
        const current = untracked(this._options);
        const snapshot = current.map((option) => option.label()).join('\u0000');
        if (snapshot !== this.labelSnapshot) {
          this.labelSnapshot = snapshot;
          this.labelVersion.update((version) => version + 1);
        }
        if (!this.mounted()) return;
        const sorted = sortOptionsByDom(current);
        if (sorted !== current) this._options.set(sorted);
      },
    });
  }

  /**
   * Opens the list. A disabled or read-only Select never opens.
   * @cckSemantic none
   * @remarks Angular only (Material): React and Vue own the state with `open` and `defaultOpen`.
   */
  open(): void {
    if (this.openState() || !this.interactive()) return;
    this.setOpen(true);
  }

  /**
   * Closes the list. Nothing is checked: `disableClose` and `closePredicate` guard the user's closes only.
   * @cckSemantic none
   * @remarks Angular only (Material): React and Vue own the state with `open` and `defaultOpen`.
   */
  close(): void {
    if (this.openState()) this.setOpen(false);
  }

  /**
   * Opens the list when it is closed and closes it when it is open.
   * @cckSemantic none
   * @remarks Angular only (Material): React and Vue own the state with `open` and `defaultOpen`.
   */
  toggle(): void {
    if (this.openState()) this.close();
    else this.open();
  }

  protected restoreMount(event: Event): void {
    const value = (this.mountValue ?? (this.multiple() ? [] : null)) as V | null;
    this.value.set(value);
    this.blockedSubmit.set(false);
    this.selectionChange.emit({ source: this, value, reason: 'form-reset', event });
  }

  protected onTriggerClick(event: MouseEvent): void {
    // A click on the label of a field forwards a click to the trigger: it takes the focus and does not open.
    if (this.labelActivation?.consume()) {
      this.triggerRef()?.nativeElement.focus();
      return;
    }
    // A press that did not focus the trigger (Safari never does; Firefox when it moves focus into a frame) must
    // not open the list with the focus elsewhere: the keys and `aria-activedescendant` belong to the trigger.
    const button = this.triggerRef()?.nativeElement;
    const { disabled, 'aria-readonly': readonly } = this.parts().trigger;
    if (button && !disabled && !readonly && deepActiveElement(button.ownerDocument) !== button) {
      button.focus({ preventScroll: true });
    }
    this.parts().trigger.onClick(event);
  }

  protected onTriggerKeyDown(event: KeyboardEvent): void {
    // The dismiss layer answers Escape while the list is open, so that one intent reaches the refusals.
    if (event.key === 'Escape' && this.isOpen() && this.dismissal) return;
    this.parts().trigger.onKeyDown(event);
  }

  protected onTriggerBlur(event: FocusEvent): void {
    // A press outside is being decided: the focus move it causes must not close the list on its own.
    if (!this.focusOutHeld) this.parts().trigger.onBlur(event);
    this.typeahead().reset();
    this.onBlur();
  }

  /**
   * The browser wrote into a hidden input (autofill). A single Select chooses the enabled option whose form
   * string equals the write; any other write is undone, and a multiple Select ignores it.
   */
  protected onAutofill(event: Event, current: string): void {
    const input = event.target as HTMLInputElement;
    const state = this.baseState();
    const match =
      this.multiple() || !this.interactive()
        ? undefined
        : this._options().find((option) => {
            const value = option.value() as CckSelectItem<V> | null | undefined;
            return !option.disabled() && value != null && valueToFormString(state, value) === input.value;
          });
    if (!match) {
      input.value = current;
      return;
    }
    const value = match.value() as CckSelectItem<V>;
    const selected = this.value() as CckSelectItem<V> | null | undefined;
    if (selected == null || !this.compareWith()(selected, value)) this.commit(value, event);
  }

  /** Writes a value the user chose and tells the parent. */
  private commit(value: unknown, event: Event | null): void {
    this.value.set(value as V | null);
    this.dirtyState.set(true);
    this.selectionChange.emit({ source: this, value: value as V | null, reason: 'user', event });
  }

  /** Changes the open state and tells the parent, for a user event and for `open()`, `close()` and `toggle()`. */
  private setOpen(open: boolean): void {
    this.openState.set(open);
    if (open && this.isOpen()) this.startDismissLayer();
    else this.stopDismissLayer();
    this.openedChange.emit(open);
    (open ? this.opened : this.closed).emit();
  }

  /** Applies the highlight and the open change of a transition. */
  private applyOpen(next: SelectTransition<CckSelectItem<V>>): void {
    if (next.highlight !== undefined) this.highlighted.set(next.highlight ?? undefined);
    if (next.open) this.setOpen(next.open.open);
  }

  /**
   * Registers the dismiss layer if it is not registered yet. `setOpen` starts it as soon as the list opens, so an
   * Escape or an outside press that comes before the list has rendered still closes it.
   */
  private startDismissLayer(): void {
    if (this.dismissal || !this.triggerRef()) return;
    const dismissal = this.zone.outside(() =>
      createTriggerDismissLayer({
        trigger: () => this.triggerRef()?.nativeElement ?? null,
        inside: () => [this.triggerRef()?.nativeElement ?? null, this.fieldAnchor(), this._contentElement()],
        parent: () => this.parentLayer?.current ?? null,
        escape: (intent) =>
          this.zone.inside(() => this.send({ type: 'LIST.DISMISS', reason: 'escape', event: intent.event })),
        press: (intent, focusLeft) =>
          this.zone.inside(() =>
            this.send({ type: 'LIST.DISMISS', reason: 'outside-press', event: intent.event, focusLeft }),
          ),
        holdFocusOut: (held) => {
          this.zone.inside(() => {
            this.focusOutHeld = held;
          });
        },
      }),
    );
    this.dismissal = dismissal;
    this.layer.current = dismissal.layer;
  }

  /** Removes the dismiss layer; safe to call when there is none. */
  private stopDismissLayer(): void {
    const dismissal = this.dismissal;
    if (!dismissal) return;
    dismissal.stop();
    if (this.layer.current === dismissal.layer) this.layer.current = null;
    this.dismissal = null;
  }

  /**
   * Applies an event: the close is asked of `disableClose` and `closePredicate` first, then the value is written
   * and the open state changes. A refused close in the list (`select`) still writes the value.
   *
   * @param event - What happened.
   * @returns Whether the event took effect, so that a refused Escape stays with the layer.
   */
  protected send(event: SelectEvent): boolean {
    const next = transitionSelect(this.state(), event);
    if (!next) return false;
    const closing = next.open && !next.open.open ? next.open.reason : undefined;
    const refused = closing !== undefined && !this.allowClose(closing, event.event);
    // Only a choice in the list keeps its value when the close is refused.
    if (refused && closing !== 'select') return false;
    if (!refused) this.applyOpen(next);
    if (next.reveal) this.revealTick.update((tick) => tick + 1);
    if (next.value !== undefined) this.commit(next.value, event.event);
    return !refused;
  }
}

/**
 * Finds the Select above a part.
 *
 * @param part - The part's name, for the error message.
 * @returns The Select.
 * @internal
 */
export function injectCckSelect<V>(part: string): CckSelect<V> {
  const root = inject<CckSelect<V>>(CckSelect, { optional: true });
  if (!root) throw new Error(`CocoKits: cckSelect${part} must be placed inside an element with cckSelect.`);
  return root;
}
