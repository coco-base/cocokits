import {
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import { CckAttrs, IdGenerator, injectFormParticipation, themeAttrs } from '@cocokits/angular-core';
import { CckRadioGroup } from '@cocokits/angular/radio-group';
import { getRadioProps, radioAnatomy } from '@cocokits/machines/radio';
import type { ChangeDetails, ValueChangeDetails } from '@cocokits/shared';

/**
 * Why the checked value of a Radio changed.
 * @cckValue 'user' - The user checked this radio or another radio with the same `name`.
 * @cckValue 'form-reset' - The form that holds the radio was reset.
 */
export type RadioChangeReason = 'user' | 'form-reset';

/** The `reason` and the `event` of a change. The `checkedChangeDetails` output sends them with the `value`. */
export type RadioChangeDetails = ChangeDetails<RadioChangeReason>;

/**
 * One radio with its label. It wraps a native `<input type="radio">`. The content you write inside it becomes the label.
 *
 * Radios with the same `name` form a native group. The browser unchecks the other radios and moves the focus with the arrow keys. When the user checks another radio of the group, this radio's `checked` becomes `false` and `checkedChangeDetails` emits.
 *
 * When you set `checked` from code, set it on every radio of the group from one value. The other radios emit nothing for your change.
 *
 * Inside a `cck-radio-group`, the group owns the value. The radio is checked while its `submitValue` equals the value of the group. The radio takes the `name`, `disabled` and `required` of the group. Its own `checked`, `name` and `checkedChangeDetails` do nothing there.
 *
 * The radio does not join a form field and does not bind a forms library. For a form value, use a `cck-radio-group`.
 *
 * @example
 * <cck-radio name="plan" submitValue="free" [(checked)]="isFree">Free</cck-radio>
 * <cck-radio name="plan" submitValue="pro" [(checked)]="isPro">Pro</cck-radio>
 * @cckPart root
 * @cckPart wrapper
 * @cckPart inputWrapper
 * @cckPart input
 * @cckPart backdrop
 * @cckPart background
 * @cckPart label
 * @cckSlot default - The text of the label. When not set, the label is empty, so name the radio with `aria-label`.
 */
@Component({
  selector: 'cck-radio',
  exportAs: 'cckRadio',
  encapsulation: ViewEncapsulation.None,
  imports: [CckAttrs],
  host: {
    '[class]': 'parts().root.class',
    '[attr.id]': 'null',
    '[attr.name]': 'null',
    '[attr.form]': 'null',
    '[attr.aria-label]': 'null',
    '[attr.aria-labelledby]': 'null',
    '[attr.aria-describedby]': 'null',
    '[attr.data-checked]': 'parts().root["data-checked"]',
    '[attr.data-disabled]': 'parts().root["data-disabled"]',
    '[attr.data-required]': 'parts().root["data-required"]',
  },
  template: `
    <span [class]="parts().wrapper.class" [cckAttrs]="theme().wrapper">
      <span [class]="parts().inputWrapper.class" [cckAttrs]="theme().inputWrapper">
        <input
          #input
          [attr.type]="parts().input.type"
          [class]="parts().input.class"
          [cckAttrs]="theme().input"
          [attr.id]="parts().input.id"
          [attr.name]="parts().input.name"
          [attr.value]="submitValue() ?? null"
          [attr.form]="inputForm()"
          [checked]="parts().input.checked"
          [attr.checked]="parts().input.checked ? '' : null"
          [attr.disabled]="parts().input.disabled ? '' : null"
          [attr.required]="parts().input.required ? '' : null"
          [attr.tabindex]="parts().input.tabIndex ?? null"
          [attr.aria-describedby]="ariaDescribedBy() ?? null"
          [attr.aria-label]="ariaLabel() ?? null"
          [attr.aria-labelledby]="ariaLabelledBy() ?? null"
          (change)="onChange($event)"
        />
        <span
          [class]="parts().backdrop.class"
          [attr.aria-hidden]="parts().backdrop['aria-hidden']"
          [cckAttrs]="theme().backdrop"
        ></span>
        <span
          [class]="parts().background.class"
          [attr.aria-hidden]="parts().background['aria-hidden']"
          [cckAttrs]="theme().background"
        ></span>
      </span>
      <label [class]="parts().label.class" [cckAttrs]="theme().label" [attr.for]="parts().label.for">
        <ng-content />
      </label>
    </span>
  `,
})
export class CckRadio {
  private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('input');
  private readonly generatedId = inject(IdGenerator).getId(radioAnatomy.classes.root);
  private readonly participation = injectFormParticipation({
    getChecked: () => this.parts().input.checked,
    element: () => this.inputRef()?.nativeElement,
    onReset: (event) => {
      if (this.group) {
        this.group._formReset(event);
        return;
      }
      this.checked.set(this.mountValue);
      this.checkedChangeDetails.emit({ value: this.mountValue, reason: 'form-reset', event });
    },
    onUncheckedByGroup: (event) => {
      this.onUncheckedByGroup(event);
    },
  });

  private readonly group = inject(CckRadioGroup, { optional: true });
  private readonly destroyRef = inject(DestroyRef);
  private mountValue = false;

  /**
   * Whether the radio is checked. Use `[(checked)]` to read and change it.
   * @remarks It becomes `false` when the user checks another radio with the same `name`. A `null` or `undefined` value shows the radio unchecked. Inside a `cck-radio-group`, it does nothing.
   * @defaultValue false
   */
  readonly checked = model(false);

  /**
   * Emits after the user checks this radio or another radio with the same `name`, and after a form reset. It sends the new `value`, the `reason` and the `event`.
   * @remarks It never emits when the parent changes `checked`. Inside a `cck-radio-group`, it never emits; the group emits the change.
   * @example
   * <cck-radio name="plan" submitValue="free" (checkedChangeDetails)="onChange($event.value, $event.reason)">Free</cck-radio>
   * <!-- In the class: onChange(checked: boolean, reason: RadioChangeReason) { console.log(checked, reason); } -->
   * @cckSemantic *.checkedChange
   */
  readonly checkedChangeDetails = output<ValueChangeDetails<boolean, RadioChangeReason>>();

  /** The `id` of the native input. When not set, the input gets a generated id. */
  readonly id = input<string | undefined>(undefined);

  /**
   * The `name` that puts radios in one group. `FormData` sends it with the value. When not set, the radio is alone, and a warning shows in development.
   * @remarks Give every radio of a group the same name. Inside a `cck-radio-group`, the radio takes the name of the group instead.
   * @cckSemantic *.name
   * @cckParity Declared as an input.
   */
  readonly name = input<string | undefined>(undefined);

  /**
   * The value that `FormData` sends while the radio is checked. When not set, the browser sends `on`.
   * @remarks Inside a `cck-radio-group`, it is the value of the radio. The radio is checked while the value of the group equals it. Without it, the radio can never be checked there. The name is `submitValue`, as on the Checkbox.
   * @cckSemantic *.value
   * @cckParity Declared as an input.
   */
  readonly submitValue = input<string | undefined>(undefined);

  /**
   * The `id` of the form that the native input belongs to. Use it when the radio is outside its form. When not set, the form around the radio owns the input.
   * @cckSemantic none
   * @cckParity Declared as an input.
   */
  readonly form = input<string | undefined>(undefined);

  /**
   * The ids of the elements that describe the radio. The native input gets them as `aria-describedby`. When not set, the radio has no description.
   * @cckSemantic *.ariaDescribedBy
   */
  readonly ariaDescribedBy = input<string | undefined>(undefined, { alias: 'aria-describedby' });

  /**
   * The accessible name of the native input, as `aria-label`. When not set, the content you write inside the radio names it.
   * @cckSemantic *.ariaLabel
   */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  /**
   * The ids of the elements that name the native input, as `aria-labelledby`. When not set, the content you write inside the radio names it.
   * @cckSemantic *.ariaLabelledBy
   */
  readonly ariaLabelledBy = input<string | undefined>(undefined, { alias: 'aria-labelledby' });

  /**
   * Whether the user cannot use the radio. A disabled `fieldset` around it also disables it.
   * @defaultValue false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * Whether one radio of the group must be checked before the form can submit. It sets the native `required`.
   * @defaultValue false
   */
  readonly required = input(false, { transform: booleanAttribute });

  /** The theme attributes of every part; the root's are applied to the host. */
  protected readonly theme = themeAttrs(radioAnatomy);

  /** What the group gives this radio; `undefined` outside a group. */
  private readonly groupFacts = computed(() =>
    this.group?._parts().radio({
      value: this.submitValue(),
      disabled: this.ownDisabled(),
      required: this.required(),
      form: this.form(),
    }),
  );

  protected readonly parts = computed(() => {
    const facts = this.groupFacts();
    return getRadioProps({
      checked: facts ? facts.checked : this.checked(),
      id: this.ownId(),
      name: facts ? facts.name : this.name(),
      disabled: facts ? facts.disabled === true : this.ownDisabled(),
      required: facts ? facts.required === true : this.required(),
      tabIndex: facts?.tabIndex,
    });
  });

  /** The `form` attribute of the input: the radio's own, else the group's. */
  protected readonly inputForm = computed(() => (this.groupFacts() ? this.groupFacts()?.form : this.form()) ?? null);

  private readonly ownDisabled = computed(() => this.disabled() || this.participation.fieldsetDisabled());

  /** The author's id, or the generated one: the input always has an id, because the label needs it. */
  private ownId(): string {
    const own = this.id();
    return own === undefined || own === '' ? this.generatedId : own;
  }

  constructor() {
    afterNextRender(() => {
      this.mountValue = this.parts().input.checked;
      const input = this.inputRef()?.nativeElement;
      if (this.group && input) {
        const unregister = this.group._register({
          element: input,
          value: this.submitValue,
          disabled: this.ownDisabled,
          required: this.required,
          form: this.form,
        });
        this.destroyRef.onDestroy(unregister);
      }
      this.warnWithoutName();
    });
  }

  /**
   * Moves the focus to the native input.
   * @example
   * // radio = viewChild.required(CckRadio)
   * this.radio().focus();
   * @cckSemantic none
   * @cckParity Only this framework has this member.
   */
  focus(options?: FocusOptions): void {
    this.inputRef()?.nativeElement.focus(options);
  }

  protected onChange(event: Event): void {
    if (this.group) {
      this.onGroupChange(event);
      return;
    }
    const checked = (event.target as HTMLInputElement).checked;
    this.checked.set(checked);
    this.checkedChangeDetails.emit({ value: checked, reason: 'user', event });
  }

  /** Inside a group the group owns the value: this radio reports its check and fires no event of its own. */
  private onGroupChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = this.submitValue();
    if (value === undefined) {
      // A radio without a value can never be checked.
      input.checked = false;
      return;
    }
    if (input.checked) this.group?._userChecked(value, event);
  }

  /** Another radio of the group was checked: this one is unchecked by the browser and gets no event of its own. */
  private onUncheckedByGroup(event: Event): void {
    if (this.group || !this.checked()) return;
    this.checked.set(false);
    this.checkedChangeDetails.emit({ value: false, reason: 'user', event });
  }

  private warnWithoutName(): void {
    if (typeof ngDevMode !== 'undefined' && !ngDevMode) return;
    if (this.group) {
      if (this.submitValue() === undefined) {
        console.warn('CocoKits: a Radio in a Radio group has no submitValue, so it can never be checked.');
      }
      return;
    }
    if (!this.name()) {
      console.warn(
        'CocoKits: a Radio has no name. Radios with the same name form a group; give every radio of the group the same name.',
      );
    }
  }
}
