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

/** Why the checked value of a Radio changed: the user checked it or another radio of its group (`'user'`), or the form was reset (`'form-reset'`). */
export type RadioChangeReason = 'user' | 'form-reset';

/** What the framework-neutral change callback of a Radio receives; the Angular output adds the `value`. */
export type RadioChangeDetails = ChangeDetails<RadioChangeReason>;

/**
 * One standalone radio around a native `<input type="radio">` with its label. Radios with the same `name`
 * form a native group: the browser unchecks the others and moves focus with the arrow keys. The host is the
 * root (a `<div>` by default) and the content you write becomes the label.
 *
 * When the user checks another radio of the group, this radio's `checked` becomes `false` and
 * `checkedChangeDetails` emits with `'user'` and the other radio's event. A parent that sets one radio's
 * `checked` and not the others gets no event for the others: write every radio's `checked` from one
 * selected value. A radio without `name` has no group mate, so it warns in development.
 *
 * Inside a Radio group (`cckRadioGroup`) the group owns the value: the radio is identified by its
 * `submitValue`, is checked while that equals the group's value, takes the group's `name`, `disabled` and
 * `required` (its own `disabled` and `required` add to them), and the arrow keys of the group apply. Its own
 * `checked`, `name` and `checkedChangeDetails` are ignored there.
 *
 * It takes no part in the FormField contract and binds no forms library.
 *
 * @example
 * <div cckRadio name="plan" submitValue="free" [(checked)]="isFree">Free</div>
 * @cckPart root
 * @cckPart wrapper
 * @cckPart inputWrapper
 * @cckPart input
 * @cckPart backdrop
 * @cckPart background
 * @cckPart label
 * @cckSlot default - The label content.
 */
@Component({
  selector: '[cckRadio]',
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
   * Whether the radio is checked. A nullish value renders unchecked. It follows the group: when the user
   * checks another radio of the same `name`, it becomes `false`. Ignored inside a Radio group.
   * @defaultValue false
   */
  readonly checked = model(false);

  /**
   * Emits after every change the user makes, also the uncheck that another radio of the group causes, with
   * the new value and the reason. Never for a write from the parent. Never emitted inside a Radio group,
   * which emits the change.
   * @cckSemantic *.checkedChange
   */
  readonly checkedChangeDetails = output<ValueChangeDetails<boolean, RadioChangeReason>>();

  /** The `id` of the native input; generated when left out. */
  readonly id = input<string | undefined>(undefined);

  /**
   * The `name` that makes radios a group and that `FormData` submits. Give every radio of a group the same one.
   * A radio without a name has no group mate and warns in development. Ignored inside a Radio group, which
   * gives every radio its own name.
   * @cckSemantic *.name
   * @remarks React and Vue take the native `name` attribute.
   */
  readonly name = input<string | undefined>(undefined);

  /**
   * The value `FormData` submits while the radio is checked; left out, the browser submits `on`. Inside a
   * Radio group it identifies the radio: it is checked while the group's value equals it, and a radio without
   * one can never be checked.
   * @cckSemantic *.value
   * @remarks Named `submitValue`, as on the Checkbox. React and Vue take the native `value`.
   */
  readonly submitValue = input<string | undefined>(undefined);

  /**
   * The id of the form the input belongs to, when it is not inside it (native `form` attribute).
   * @cckSemantic none
   * @remarks React and Vue take the native `form` attribute.
   */
  readonly form = input<string | undefined>(undefined);

  /**
   * The ids this radio is described by (`aria-describedby` of the input).
   * @cckSemantic *.ariaDescribedBy
   */
  readonly ariaDescribedBy = input<string | undefined>(undefined, { alias: 'aria-describedby' });

  /**
   * The `aria-label` of the native input.
   * @cckSemantic *.ariaLabel
   */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  /**
   * The `aria-labelledby` of the native input.
   * @cckSemantic *.ariaLabelledBy
   */
  readonly ariaLabelledBy = input<string | undefined>(undefined, { alias: 'aria-labelledby' });

  /**
   * Whether the radio is disabled. A disabling `fieldset` adds to it.
   * @defaultValue false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * Whether the radio is required (native `required`: one radio of the group must be checked).
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
   * Focuses the native input.
   * @cckSemantic none
   * @remarks React and Vue reach the input through `ref`.
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
