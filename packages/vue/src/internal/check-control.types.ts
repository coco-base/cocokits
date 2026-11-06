import type { Component } from 'vue';
import type { AsTag } from '@cocokits/vue-core';

/**
 * The props the three choice controls share. Other native input attributes and listeners (`form`, `onFocus`, ...)
 * go to the `<input>`; `class`, `style` and `hidden` stay on the root.
 */
export interface ChoiceControlProps {
  /** The `id` of the native input; generated when left out. */
  readonly id?: string | undefined;
  /**
   * Disables the control. A disabling `fieldset` adds to it.
   *
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * Makes the control required (native `required`).
   *
   * @defaultValue false
   */
  readonly required?: boolean | undefined;
  /**
   * The ids this control is described by (`aria-describedby` of the input).
   *
   * @cckSemantic *.ariaDescribedBy
   * @remarks Written `aria-describedby` in a template; the prop is its camel-cased form.
   */
  readonly ariaDescribedby?: string | undefined;
  /**
   * The `aria-label` of the native input, for a control with no caption.
   *
   * @cckSemantic *.ariaLabel
   * @remarks Written `aria-label` in a template; the prop is its camel-cased form.
   */
  readonly ariaLabel?: string | undefined;
  /**
   * The `aria-labelledby` of the native input.
   *
   * @cckSemantic *.ariaLabelledBy
   * @remarks Written `aria-labelledby` in a template; the prop is its camel-cased form.
   */
  readonly ariaLabelledby?: string | undefined;
  /**
   * The element of the root.
   *
   * @cckSemantic none
   * @remarks The input is always a native `<input>`.
   * @cckParity Replaces the rendered element with `as`. The input is always a native `<input>`.
   * @defaultValue 'div'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Merges the root onto the one child of the default slot, and the child's own children become the label content.
   *
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/** The props a Checkbox and a Switch share on top of {@link ChoiceControlProps}: the FormField contract. */
export interface CheckControlProps extends ChoiceControlProps {
  /** The `id` of the native input. Inside a FormField it defaults to `<fieldId>-control`; an explicit value wins and the Label follows it. */
  readonly id?: string | undefined;
  /**
   * The ids this control is described by. Inside a FormField the feedback wrapper id is added after them.
   *
   * @cckSemantic *.ariaDescribedBy
   * @remarks Written `aria-describedby` in a template; the prop is its camel-cased form.
   */
  readonly ariaDescribedby?: string | undefined;
  /**
   * Disables the control. A disabling `fieldset` and the field's `disabled` add to it.
   *
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * The name `FormData` submits. You set it (for example `name="terms"` next to `v-model`); no forms library fills it in.
   *
   * @cckSemantic none
   * @cckParity A native attribute of the element.
   */
  readonly name?: string | undefined;
  /**
   * The value `FormData` submits while the control is checked; left out, the browser submits `on`.
   *
   * @cckSemantic *.value
   * @cckParity A native attribute of the element.
   */
  readonly value?: string | undefined;
  /**
   * Makes the control read-only: a click, a click on the label and Space change nothing and emit nothing; it
   * stays focusable and is submitted. Renders `aria-readonly="true"`.
   *
   * @cckSemantic *.readOnly
   * @cckParity Spelled as the native `readonly` attribute.
   * @defaultValue false
   */
  readonly readonly?: boolean | undefined;
  /**
   * Marks the control invalid. `aria-invalid` waits for `touched` or `submitted`.
   *
   * @defaultValue false
   */
  readonly invalid?: boolean | undefined;
  /**
   * An asynchronous validator is running.
   *
   * @defaultValue false
   */
  readonly pending?: boolean | undefined;
  /**
   * Hides the control (native `hidden` on the root).
   *
   * @cckSemantic none
   * @cckParity A native attribute of the element.
   * @defaultValue false
   */
  readonly hidden?: boolean | undefined;
  /** Whether the user left the control. Given, it wins; otherwise it is set after the first blur. */
  readonly touched?: boolean | undefined;
  /** Whether the user changed the control. Given, it wins; otherwise it is set after the first change. */
  readonly dirty?: boolean | undefined;
  /**
   * Whether a submit of the owner form was attempted. Given, it wins (bind it to the forms library's submit
   * state); otherwise a `submit` event of the form sets it, canceled ones included, and a reset clears it.
   */
  readonly submitted?: boolean | undefined;
}
