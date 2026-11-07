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

/** Why the value of a Radio group changed. */
export type RadioGroupChangeReason = MachineChangeReason;

/** Which arrow keys move through the radios of a group. */
export type RadioGroupOrientation = MachineOrientation;

/** What `valueChangeDetails` sends: the new `value`, the `reason` and the `event`. */
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
 * A group of radios with one value. You write `cck-radio` elements inside it. The group is the `radiogroup` element.
 *
 * Each radio is checked while its `submitValue` equals the `value` of the group. Each radio takes the `name`, `disabled` and `required` of the group. Name the group with `aria-labelledby` or `aria-label`.
 *
 * The group is one tab stop. Tab moves the focus to the checked radio, or to the first enabled radio. The arrow keys move the focus and the check to the next enabled radio.
 *
 * The value is a model. Use `[(value)]` to read and change it, `[value]` to only set it, or no binding. The group works with Signal Forms. Through `ngNoCva` it also works with `formControlName`, `[formControl]` and `ngModel`.
 *
 * The radios are native inputs, so `FormData`, `required`, `form` and form reset work. A form reset sets the value back to the value at the first render.
 *
 * @example
 * <span id="plan-label">Plan</span>
 * <cck-radio-group aria-labelledby="plan-label" [(value)]="plan">
 *   <cck-radio submitValue="free">Free</cck-radio>
 *   <cck-radio submitValue="pro">Pro</cck-radio>
 * </cck-radio-group>
 * @cckPart root
 * @cckSlot default - The `cck-radio` elements. When not set, the group is empty.
 */
@Directive({
  selector: 'cck-radio-group',
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
   * The `submitValue` of the checked radio. `null` checks no radio.
   * @remarks A value that matches no radio is kept, and no radio is checked. Changing the value from code never emits `valueChangeDetails`.
   * @cckSemantic radio-group.value
   * @defaultValue null
   */
  readonly value = model<string | null>(null);

  /**
   * Emits after the user checks a radio, and after a form reset that changes the value. It sends the new `value`, the `reason` and the `event`.
   * @remarks The user can check a radio with a click, the label, Space or an arrow key. It never emits when the parent or a forms library changes the value.
   * @example
   * <cck-radio-group aria-label="Plan" (valueChangeDetails)="onChange($event)">
   *   <cck-radio submitValue="free">Free</cck-radio>
   *   <cck-radio submitValue="pro">Pro</cck-radio>
   * </cck-radio-group>
   * <!-- In the class: onChange(details: RadioGroupChangeDetails) { console.log(details.value, details.reason); } -->
   * @cckSemantic radio-group.valueChange
   */
  readonly valueChangeDetails = output<RadioGroupChangeDetails>();

  /**
   * The `name` that every radio of the group shares. `FormData` sends it with the value. When not set, the group makes a stable name, so `required` still works.
   * @remarks The host does not get the attribute.
   * @cckSemantic radio-group.name
   * @defaultValue generated
   */
  readonly name = input('');

  /**
   * Whether the user cannot use any radio of the group. A radio can also be disabled on its own or by a disabled `fieldset`.
   * @cckSemantic radio-group.disabled
   * @defaultValue false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * Whether one radio must be checked before the form can submit. Every radio gets the native `required`, and the group gets `aria-required`.
   * @cckSemantic radio-group.required
   * @defaultValue false
   */
  readonly required = input(false, { transform: booleanAttribute });

  /**
   * The `id` of the form that the radios belong to. A radio with its own `form` keeps it. When not set, the form around the group owns the radios.
   * @cckSemantic radio-group.form
   */
  readonly form = input<string | undefined>(undefined);

  /**
   * Which arrow keys move between the radios. It also sets `aria-orientation`. When not set, all four arrow keys move.
   * @cckValue 'horizontal' - Only Left and Right move.
   * @cckValue 'vertical' - Only Up and Down move.
   * @cckSemantic radio-group.orientation
   * @defaultValue both axes
   */
  readonly orientation = input<'horizontal' | 'vertical' | undefined>(undefined);

  /**
   * Whether the arrow keys go from the last radio to the first, and from the first to the last.
   * @cckSemantic radio-group.loop
   * @defaultValue true
   */
  readonly loop = input(true, { transform: booleanAttribute });

  /**
   * Emits when the focus leaves the group. Signal Forms listens to it to mark the field as touched.
   * @remarks It does not emit when the focus moves between the radios.
   * @cckGroup forms
   * @cckSemantic none
   * @cckParity Signal Forms bind this output.
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
