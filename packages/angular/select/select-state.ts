import {
  ElementRef,
  computed,
  inject,
  linkedSignal,
  signal,
  viewChild,
  Directive,
  type Signal,
  type TemplateRef,
} from '@angular/core';
import { IdGenerator, themeAttrs } from '@cocokits/angular-core';
import type { OverlayAlign, OverlaySide } from '@cocokits/cdk/positioning';
import { createTypeahead } from '@cocokits/cdk/roving-focus';
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
import { mayClose, sortSelectValues, toSelectItems } from './select-helpers';
import { CckSelectInputs } from './select-inputs';
import {
  CCK_SELECT_CONFIG,
  type CckSelectItem,
  type SelectOpenChangeReason,
  type SelectOptionRegistration,
  type SelectTriggerContext,
} from './select-types';

/**
 * The state of `CckSelect`: the registered options, the open and highlight state, the machine state and the props
 * of every part, worked out from the inputs. Not for direct use or extension.
 */
@Directive()
export abstract class CckSelectState<V = string> extends CckSelectInputs<V> {
  /** The theme attributes of every part; the root's are applied to the host. @internal */
  readonly _theme = themeAttrs(selectAnatomy);

  /** @internal */
  readonly _contentElement = signal<HTMLElement | null>(null);
  /** @internal */
  readonly _triggerTemplate = signal<TemplateRef<SelectTriggerContext<unknown>> | null>(null);
  /** @internal */
  readonly _options = signal<readonly SelectOptionRegistration[]>([]);

  protected readonly selectId = inject(IdGenerator).getId(selectAnatomy.classes.root);
  protected readonly config = inject(CCK_SELECT_CONFIG, { optional: true });
  protected readonly typeahead = computed(() =>
    createTypeahead({ timeoutMs: this.typeaheadDebounceInterval() ?? this.config?.typeaheadDebounceInterval }),
  );
  protected readonly triggerRef = viewChild<ElementRef<HTMLButtonElement>>('trigger');
  protected readonly openState = signal(false);
  protected readonly mounted = signal(false);
  protected readonly placement = signal<{ side: OverlaySide; align: OverlayAlign } | null>(null);
  /** Bumped when the text of an option changed: the labels are read from the document, not from a signal. */
  protected readonly labelVersion = signal(0);

  /** Whether the Select reacts to the user: not disabled and not read-only, by itself or by its field. */
  protected readonly interactive = computed(() => {
    const field = this.fieldContext()?.state;
    const facts = this.facts();
    return ![facts.disabled, facts.readOnly, field?.disabled, field?.readOnly].some(Boolean);
  });

  protected readonly isOpen = computed(() => this.openState() && this.interactive());

  protected readonly items = computed<readonly SelectItem<CckSelectItem<V>>[]>(() => {
    this.labelVersion();
    return toSelectItems<CckSelectItem<V>>(this._options());
  });

  /** The key of the highlighted option. The highlight starts on the selected option, else the first enabled. */
  protected readonly highlighted = linkedSignal<boolean, string | undefined>({
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
  protected readonly baseState = computed<SelectState<CckSelectItem<V>>>(() => ({
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

  protected readonly state = computed<SelectState<CckSelectItem<V>>>(() => ({
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

  protected readonly validationMessage = signal('');

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

  /** Whether the user's close may happen: `disableClose` for Escape and a press, then `closePredicate`. */
  protected allowClose(reason: SelectOpenChangeReason, event: Event | null): boolean {
    return mayClose(reason, this.disableClose(), () => this.closePredicate()?.({ reason, event }) !== false);
  }

  /** The key the highlight starts on: the selected option, else the first enabled one. */
  private initialHighlight(): string | undefined {
    return resolveSelectHighlight(this.baseState(), 'selected') ?? undefined;
  }

  /**
   * Applies an event: the close is asked of `disableClose` and `closePredicate` first, then the value is written
   * and the open state changes.
   *
   * @param event - What happened.
   * @returns Whether the event took effect.
   */
  protected abstract send(event: SelectEvent): boolean;
}
