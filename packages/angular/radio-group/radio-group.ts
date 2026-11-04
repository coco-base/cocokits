import {
  Directive,
  ElementRef,
  afterEveryRender,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  linkedSignal,
  model,
  output,
  signal,
  untracked,
  type Signal,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { CckDirection, IdGenerator, themeAttrs } from '@cocokits/angular-core';
import {
  getRadioGroupProps,
  radioGroupAnatomy,
  transitionRadioGroup,
  type RadioGroupChangeReason as MachineChangeReason,
  type RadioGroupEvent,
  type RadioGroupItem,
  type RadioGroupOrientation as MachineOrientation,
  type RadioGroupParts,
  type RadioGroupState,
} from '@cocokits/machines/radio-group';
import type { ValueChangeDetails } from '@cocokits/shared';
import { sortByDomOrder } from '@cocokits/utils';

/** Why the value of a Radio group changed: the user checked a radio (`'user'`) or the form was reset (`'form-reset'`). */
export type RadioGroupChangeReason = MachineChangeReason;

/** Which arrow keys move through the radios of a group. */
export type RadioGroupOrientation = MachineOrientation;

/** What the value details output of a Radio group emits. */
export type RadioGroupChangeDetails = ValueChangeDetails<string | null, RadioGroupChangeReason>;

/** What a radio tells the group about itself. @internal */
export interface CckRadioGroupRegistration {
  /** The radio's native input. */
  readonly element: HTMLInputElement;
  /** The radio's submitted value, which identifies it. */
  readonly value: Signal<string | undefined>;
  /** Whether the radio is disabled, also by a fieldset. */
  readonly disabled: Signal<boolean>;
  /** Whether the radio is required. */
  readonly required: Signal<boolean>;
  /** The radio's own `form`. */
  readonly form: Signal<string | undefined>;
}

/**
 * Sorts the radios into document order.
 *
 * @param radios - The registered radios.
 * @returns A new array in document order.
 */
function inDomOrder(radios: readonly CckRadioGroupRegistration[]): CckRadioGroupRegistration[] {
  const byElement = new Map(radios.map((radio) => [radio.element, radio]));
  return sortByDomOrder(radios.map((radio) => radio.element)).flatMap((element) => byElement.get(element) ?? []);
}

/**
 * A group of Radios with one value. Put it on the element that holds the `cckRadio` elements (a `div` by
 * default); the host is the `radiogroup`. The group is one tab stop: Tab enters at the checked radio, else the
 * first enabled one, and the arrow keys move the focus and the check to the next enabled radio. Each radio is
 * identified by its `submitValue`; it is checked while that equals the group's `value`, and it takes the
 * group's `name`, `disabled` and `required`. Name the group with `aria-labelledby` (a visible caption) or
 * `aria-label` on the host.
 *
 * The value is a model: `[(value)]`, `[value]` or unbound. The group is a Signal Forms custom control and,
 * through the static `ngNoCva` attribute, also binds to `formControlName`, `[formControl]` and `ngModel`. The
 * radios are native inputs, so `FormData`, `required`, `form` and `reset` work; a reset restores the value the
 * group had when it mounted.
 *
 * @example
 * <span id="plan-label">Plan</span>
 * <div cckRadioGroup aria-labelledby="plan-label" [(value)]="plan">
 *   <div cckRadio submitValue="free">Free</div>
 *   <div cckRadio submitValue="pro">Pro</div>
 * </div>
 * @cckPart root
 * @cckSlot default - The `cckRadio` elements.
 */
@Directive({
  selector: '[cckRadioGroup]',
  exportAs: 'cckRadioGroup',
  host: {
    ngNoCva: '',
    '[class]': '_parts().root.class',
    '[attr.role]': '_parts().root.role',
    '[attr.name]': 'null',
    '[attr.form]': 'null',
    '[attr.aria-required]': '_parts().root["aria-required"] ?? null',
    '[attr.aria-disabled]': '_parts().root["aria-disabled"] ?? null',
    '[attr.aria-orientation]': '_parts().root["aria-orientation"] ?? null',
    '[attr.data-disabled]': '_parts().root["data-disabled"] ?? null',
    '[attr.data-required]': '_parts().root["data-required"] ?? null',
    '[attr.data-orientation]': '_parts().root["data-orientation"] ?? null',
    '(keydown)': 'onKeyDown($event)',
    '(focusout)': 'onFocusOut($event)',
  },
})
export class CckRadioGroup implements FormValueControl<string | null> {
  /**
   * The value of the checked radio; `null` checks none. A value that matches no radio is kept and checks none.
   * Two-way, one-way (the start value) or unbound. A write from the parent or a forms library never emits the
   * details output.
   * @cckSemantic radio-group.value
   * @defaultValue null
   */
  readonly value = model<string | null>(null);

  /**
   * Emits after every change the user makes (a radio checked by click, label, Space or an arrow key) and after
   * a form reset that changes the value, with the new value and the reason. Never for a write from the parent.
   * @cckSemantic radio-group.valueChange
   */
  readonly valueChangeDetails = output<RadioGroupChangeDetails>();

  /**
   * The `name` every radio of the group shares and that `FormData` submits. Left out, a stable name is
   * generated, so the browser unchecks the peers and `required` works. Not rendered on the host.
   * @cckSemantic radio-group.name
   * @defaultValue generated
   */
  readonly name = input('');

  /**
   * Whether every radio is disabled. A radio's own `disabled` and a disabling `fieldset` add to it.
   * @cckSemantic radio-group.disabled
   * @defaultValue false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * Whether one radio must be checked (native `required` on every radio, `aria-required` on the host).
   * @cckSemantic radio-group.required
   * @defaultValue false
   */
  readonly required = input(false, { transform: booleanAttribute });

  /**
   * The id of the form the radios belong to (native `form`), for radios that have none of their own. Not
   * rendered on the host.
   * @cckSemantic radio-group.form
   */
  readonly form = input<string | undefined>(undefined);

  /**
   * Limits the arrow keys to one axis; unset, both axes move. It also sets `aria-orientation`.
   * @cckSemantic radio-group.orientation
   * @defaultValue both axes
   */
  readonly orientation = input<'horizontal' | 'vertical' | undefined>(undefined);

  /**
   * Whether the arrow keys wrap from the last radio to the first and back.
   * @cckSemantic radio-group.loop
   * @defaultValue true
   */
  readonly loop = input(true, { transform: booleanAttribute });

  /**
   * Emits when focus leaves the group (not when it moves between its radios), for Signal Forms' touched state.
   * @cckSemantic none
   * @remarks Signal Forms' output; the React and Vue Radio group have no such prop.
   */
  readonly touch = output();

  /** The theme attributes of every part; the root's are applied to the host. @internal */
  readonly _theme = themeAttrs(radioGroupAnatomy);

  private readonly registry = signal<ReadonlySet<CckRadioGroupRegistration>>(new Set());

  /** The radios in document order. */
  private readonly ordered = linkedSignal<ReadonlySet<CckRadioGroupRegistration>, readonly CckRadioGroupRegistration[]>(
    {
      source: this.registry,
      computation: (radios) => inDomOrder([...radios]),
    },
  );

  private readonly generatedName = inject(IdGenerator).getId(radioGroupAnatomy.classes.root);
  private readonly direction = inject(CckDirection);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly mounted = signal(false);
  private mountValue: string | null = null;
  private lastReset: Event | undefined;

  private readonly state = computed<RadioGroupState>(() => ({
    value: this.value(),
    name: this.name() || this.generatedName,
    items: this.ordered().map((radio): RadioGroupItem => ({
      value: radio.value(),
      disabled: radio.disabled(),
      required: radio.required(),
      form: radio.form(),
    })),
    disabled: this.disabled(),
    required: this.required(),
    form: this.form(),
    orientation: this.orientation(),
    loop: this.loop(),
    dir: this.direction.dir(),
    mounted: this.mounted(),
  }));

  /** The root props and, per radio, what the group gives it. @internal */
  readonly _parts: Signal<RadioGroupParts> = computed(() =>
    getRadioGroupProps(this.state(), (event) => {
      this.send(event);
    }),
  );

  constructor() {
    // A keyed reorder changes no signal the group tracks: read the DOM order after every render.
    afterEveryRender({
      read: () => {
        const current = untracked(this.ordered);
        const sorted = inDomOrder(current);
        if (sorted.some((radio, index) => radio !== current[index])) this.ordered.set(sorted);
      },
    });
    afterNextRender(() => {
      this.mountValue = untracked(this.value);
      this.mounted.set(true);
    });
  }

  /**
   * Registers a radio.
   *
   * @param radio - The radio.
   * @returns The function that unregisters it.
   * @internal
   */
  _register(radio: CckRadioGroupRegistration): () => void {
    this.registry.update((radios) => new Set(radios).add(radio));
    return () => {
      this.registry.update((radios) => {
        const next = new Set(radios);
        next.delete(radio);
        return next;
      });
    };
  }

  /**
   * A radio was checked by the user: sets the value and emits once.
   *
   * @param value - The radio's value.
   * @param event - The native `change` event.
   * @internal
   */
  _userChecked(value: string, event: Event): void {
    if (this.value() === value) return;
    this.value.set(value);
    this.valueChangeDetails.emit({ value, reason: 'user', event });
  }

  /**
   * The owner form was reset: restores the value the group had at mount and emits once when it changes. Every
   * radio reports the same reset, so the event is remembered.
   *
   * @param event - The `reset` event.
   * @internal
   */
  _formReset(event: Event): void {
    if (this.lastReset === event) return;
    this.lastReset = event;
    if (this.value() === this.mountValue) return;
    this.value.set(this.mountValue);
    this.valueChangeDetails.emit({ value: this.mountValue, reason: 'form-reset', event });
  }

  protected onKeyDown(event: KeyboardEvent): void {
    const current = this.ordered()
      .find((radio) => radio.element === event.target)
      ?.value();
    this._parts().root.onKeyDown(event, current);
  }

  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget;
    if (!(next instanceof Node) || !this.host.contains(next)) this.touch.emit();
  }

  private send(event: RadioGroupEvent): void {
    const { focus, activate } = transitionRadioGroup(this.state(), event);
    if (focus !== undefined) this.elementOf(focus)?.focus();
    // A click on the input runs the native check and its `change`, the same path as a pointer check.
    if (activate !== undefined) this.elementOf(activate)?.click();
  }

  private elementOf(value: string): HTMLInputElement | undefined {
    return this.ordered().find((radio) => radio.value() === value)?.element;
  }
}
