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
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  linkedSignal,
  model,
  output,
  signal,
  untracked,
  viewChild,
  viewChildren,
  type Signal,
  type TemplateRef,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import {
  CckAttrs,
  CckDirection,
  CckOverlayLayer,
  CckPortal,
  IdGenerator,
  injectFormParticipation,
  injectZoneBoundary,
  themeAttrs,
} from '@cocokits/angular-core';
import { CckFormControlBase } from '@cocokits/angular/form-control';
import { createTriggerDismissLayer, type DismissLayer } from '@cocokits/cdk/dismissal';
import { deepActiveElement } from '@cocokits/cdk/focus';
import { trackLabelActivation, type LabelActivation } from '@cocokits/cdk/form-control';
import { startOverlayPosition, type OverlayAlign, type OverlaySide } from '@cocokits/cdk/positioning';
import { createPresence } from '@cocokits/cdk/presence';
import { createTypeahead } from '@cocokits/cdk/roving-focus';
import {
  getSelectPreviewValues,
  getSelectProps,
  getSelectValueText,
  isSelectEmpty,
  resolveSelectHighlight,
  selectAnatomy,
  transitionSelect,
  valueToFormString,
  type SelectEvent,
  type SelectItem,
  type SelectParts,
  type SelectState,
  type SelectTransition,
} from '@cocokits/machines/select';
import { hasAccessibleName, visuallyHiddenStyleText } from '@cocokits/utils';
import { CCK_SELECT_CONTENT_HOST, CckSelectContent } from './select-content';
import { mayClose, sortOptionsByDom, sortSelectValues, toSelectItems } from './select-helpers';
import {
  CCK_SELECT_CONFIG,
  type CckSelectItem,
  type CckSelectOptionRef,
  type SelectOpenChangeDetails,
  type SelectOpenChangeReason,
  type SelectOptionRegistration,
  type SelectTriggerContext,
  type SelectValueChangeReason,
} from './select-types';

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
export class CckSelect<V = string> extends CckFormControlBase implements FormValueControl<V | null | undefined> {
  /**
   * The selected value: an option's value for a single Select, a list of values with `multiple`. `undefined`
   * means unbound (nothing is selected) and `null` means nothing is selected. `''` shows the placeholder too. A
   * write from the parent or a forms library never emits `selectionChange`.
   * @cckSemantic select.value
   */
  readonly value = model<V | null | undefined>(undefined);

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

  /** The theme attributes of every part; the root's are applied to the host. @internal */
  readonly _theme = themeAttrs(selectAnatomy);

  /** @internal */
  readonly _contentElement = signal<HTMLElement | null>(null);
  /** @internal */
  readonly _triggerTemplate = signal<TemplateRef<SelectTriggerContext<unknown>> | null>(null);
  /** @internal */
  readonly _options = signal<readonly SelectOptionRegistration[]>([]);

  protected readonly hiddenStyle = visuallyHiddenStyleText;
  protected readonly validationMessage = signal('');
  private readonly selectId = inject(IdGenerator).getId(selectAnatomy.classes.root);
  private readonly portal = inject(CckPortal);
  private readonly direction = inject(CckDirection);
  private readonly layer = inject(CckOverlayLayer);
  private readonly zone = injectZoneBoundary();
  private readonly config = inject(CCK_SELECT_CONFIG, { optional: true });
  private readonly parentLayer = inject(CckOverlayLayer, { optional: true, skipSelf: true });
  private readonly typeahead = computed(() =>
    createTypeahead({ timeoutMs: this.typeaheadDebounceInterval() ?? this.config?.typeaheadDebounceInterval }),
  );
  private readonly triggerRef = viewChild<ElementRef<HTMLButtonElement>>('trigger');
  private readonly listbox = viewChild<TemplateRef<void>>('listbox');
  private readonly hiddenInputs = viewChildren<ElementRef<HTMLInputElement>>('hidden');
  private readonly openState = signal(false);
  private readonly mounted = signal(false);
  private readonly placement = signal<{ side: OverlaySide; align: OverlayAlign } | null>(null);
  private readonly revealTick = signal(0);
  /** Bumped when the text of an option changed: the labels are read from the document, not from a signal. */
  private readonly labelVersion = signal(0);
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

  /** Whether the Select reacts to the user: not disabled and not read-only, by itself or by its field. */
  private readonly interactive = computed(() => {
    const field = this.fieldContext()?.state;
    const facts = this.facts();
    return ![facts.disabled, facts.readOnly, field?.disabled, field?.readOnly].some(Boolean);
  });

  private readonly isOpen = computed(() => this.openState() && this.interactive());

  private readonly items = computed<readonly SelectItem<CckSelectItem<V>>[]>(() => {
    this.labelVersion();
    return toSelectItems<CckSelectItem<V>>(this._options());
  });

  /** The key of the highlighted option. The highlight starts on the selected option, else the first enabled. */
  private readonly highlighted = linkedSignal<boolean, string | undefined>({
    source: this.isOpen,
    computation: (open, previous) => (open ? (previous?.value ?? this.initialHighlight()) : undefined),
  });

  /**
   * Whether a submit was blocked because the Select is required and empty. It marks the trigger and the root
   * invalid and describes the trigger by the browser's message, because the focus move to the trigger hides
   * the native bubble. The next value change and a form reset clear it.
   */
  protected readonly blockedSubmit = linkedSignal<unknown, boolean>({ source: this.value, computation: () => false });

  /** The state without the highlight: what the start of the highlight is worked out from. */
  private readonly baseState = computed<SelectState<CckSelectItem<V>>>(() => ({
    ...this.facts(),
    blockedSubmit: this.blockedSubmit(),
    id: this.selectId,
    open: this.isOpen(),
    mounted: this.mounted(),
    items: this.items(),
    value: this.value() as CckSelectItem<V> | readonly CckSelectItem<V>[] | null | undefined,
    multiple: this.multiple(),
    itemToStringValue: this.itemToStringValue(),
    canSelectNullableOptions: this.canSelectNullableOptions() ?? this.config?.canSelectNullableOptions ?? false,
    orderValues: (values) => sortSelectValues(values, this._options(), this.compareWith(), this.sortComparator()),
    isItemEqual: this.compareWith(),
    labelledBy: this.ariaLabelledBy(),
    ariaLabel: this.ariaLabel(),
    side: this.placement()?.side ?? this.side(),
    align: this.placement()?.align ?? this.align(),
    typeahead: this.typeahead(),
  }));

  private readonly state = computed<SelectState<CckSelectItem<V>>>(() => ({
    ...this.baseState(),
    highlighted: this.highlighted(),
  }));

  /** The props of every part. @internal */
  readonly parts: Signal<SelectParts<CckSelectItem<V>>> = computed(() =>
    getSelectProps(
      this.state(),
      (event) => {
        this.send(event);
      },
      this.fieldContext(),
    ),
  );

  /** Whether nothing is selected: the placeholder shows. */
  protected readonly empty = computed(() => isSelectEmpty(this.state()));

  /** The text of the trigger when there is no `cckSelectTrigger` template: the labels of the selection. */
  protected readonly text = computed(() => getSelectValueText(this.state()));

  protected readonly triggerContext = computed<SelectTriggerContext<CckSelectItem<V>>>(() => ({
    selected: getSelectPreviewValues(this.state()),
  }));

  /** The values the hidden inputs carry, one input each; none while no `name` is set. */
  protected readonly formInputs = computed<readonly string[]>(() => {
    const formInput = this.parts().formInput;
    if (!formInput.name) return [];
    if (!this.multiple()) return formInput.values;
    return formInput.values.length === 0 && formInput.required ? [''] : formInput.values;
  });

  /** @internal */
  readonly _contentProps = computed(() => this.parts().content);
  /** @internal */
  readonly _contentTheme = computed(() => this._theme().content);

  /**
   * Whether the list is open.
   * @cckSemantic none
   * @remarks Angular only (Material): React and Vue own the state with `open` and `defaultOpen`.
   */
  get panelOpen(): boolean {
    return this.isOpen();
  }

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

  /** The native element of the trigger, which takes the focus. */
  protected controlElement(): HTMLElement | undefined {
    return this.triggerRef()?.nativeElement;
  }

  /**
   * Registers an option; the Select reads the registered options in document order.
   * @internal
   */
  _registerOption(option: SelectOptionRegistration): () => void {
    this._options.update((current) => [...current, option]);
    return () => {
      this._options.update((current) => current.filter((candidate) => candidate !== option));
    };
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
   * An invalid hidden input (a required, empty Select) sends the focus to the trigger. The event must not be
   * canceled (a canceled `invalid` lets the submit go on), and the browser focuses the invalid input right
   * after the event, so the trigger takes the focus back in the next task.
   */
  protected onInvalid(event: Event): void {
    this.validationMessage.set((event.target as HTMLInputElement).validationMessage);
    this.blockedSubmit.set(true);
    this.triggerRef()?.nativeElement.focus();
    setTimeout(() => {
      this.triggerRef()?.nativeElement.focus();
    }, 0);
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

  /** The key the highlight starts on: the selected option, else the first enabled one. */
  private initialHighlight(): string | undefined {
    return resolveSelectHighlight(this.baseState(), 'selected') ?? undefined;
  }

  /** Whether the user's close may happen: `disableClose` for Escape and a press, then `closePredicate`. */
  private allowClose(reason: SelectOpenChangeReason, event: Event | null): boolean {
    return mayClose(reason, this.disableClose(), () => this.closePredicate()?.({ reason, event }) !== false);
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
  private send(event: SelectEvent): boolean {
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
