import type { Component } from 'vue';
import type { AsTag } from '@cocokits/vue-core';

/**
 * The props the three choice controls share. Other native input attributes and listeners (`form`, `onFocus`, ...)
 * go to the `<input>`; `class`, `style` and `hidden` stay on the root.
 */
export interface ChoiceControlProps {
  /** The `id` of the native input. When not set, the control generates one. */
  readonly id?: string | undefined;
  /**
   * Whether the control is disabled. A disabled `fieldset` around it disables it too.
   *
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * Whether the control is required. It sets the native `required` attribute.
   *
   * @defaultValue false
   */
  readonly required?: boolean | undefined;
  /**
   * The ids of the elements that describe the control. It is the `aria-describedby` of the input. When not set,
   * nothing describes the control.
   *
   * @cckSemantic *.ariaDescribedBy
   * @remarks Write it as `aria-describedby` in a template. The prop is its camel-case form.
   */
  readonly ariaDescribedby?: string | undefined;
  /**
   * The `aria-label` of the native input, for a control with no caption. When not set, the caption or
   * `ariaLabelledby` names the control.
   *
   * @cckSemantic *.ariaLabel
   * @remarks Write it as `aria-label` in a template. The prop is its camel-case form.
   */
  readonly ariaLabel?: string | undefined;
  /**
   * The ids of the elements that name the control. It is the `aria-labelledby` of the native input. When not set,
   * the caption or `ariaLabel` names the control.
   *
   * @cckSemantic *.ariaLabelledBy
   * @remarks Write it as `aria-labelledby` in a template. The prop is its camel-case form.
   */
  readonly ariaLabelledby?: string | undefined;
  /**
   * The tag or component to render as the root. The input is always a native `<input>`. It is ignored with
   * `asChild`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`. The input is always a native `<input>`.
   * @defaultValue 'div'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the root merges onto the one child of the default slot. The children of the child become the label
   * content.
   *
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/** The props a Checkbox and a Switch share on top of {@link ChoiceControlProps}: the FormField contract. */
export interface CheckControlProps extends ChoiceControlProps {
  /**
   * The `id` of the native input. When not set, the control generates one, and inside a FormField it is
   * `<fieldId>-control`. The Label of the field follows the id you set.
   */
  readonly id?: string | undefined;
  /**
   * The ids of the elements that describe the control. Inside a FormField, the ids of its hints and then of its
   * errors come after them. When not set, only the hints and errors of the field describe the control.
   *
   * @cckSemantic *.ariaDescribedBy
   * @remarks Write it as `aria-describedby` in a template. The prop is its camel-case form.
   */
  readonly ariaDescribedby?: string | undefined;
  /**
   * Whether the control is disabled. A disabled `fieldset` around it and the `disabled` of the field disable it too.
   *
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * The name that `FormData` submits, for example `name="terms"` next to `v-model`. You set it yourself. When not
   * set, the form does not submit the control.
   *
   * @cckSemantic none
   * @cckParity A native attribute of the element.
   */
  readonly name?: string | undefined;
  /**
   * The value that `FormData` submits while the control is checked. When not set, the browser submits `on`.
   *
   * @cckSemantic *.value
   * @cckParity A native attribute of the element.
   */
  readonly value?: string | undefined;
  /**
   * Whether the control is read-only. A click, a click on the label and Space change nothing and emit nothing. The
   * control stays focusable, is submitted and renders `aria-readonly="true"`.
   *
   * @cckSemantic *.readOnly
   * @cckParity Spelled as the native `readonly` attribute.
   * @defaultValue false
   */
  readonly readonly?: boolean | undefined;
  /**
   * Whether the control is invalid. `aria-invalid` appears only after `touched` or `submitted`.
   *
   * @defaultValue false
   */
  readonly invalid?: boolean | undefined;
  /**
   * Whether an asynchronous validator is running.
   *
   * @defaultValue false
   */
  readonly pending?: boolean | undefined;
  /**
   * Whether the control is hidden. It sets the native `hidden` attribute on the root.
   *
   * @cckSemantic none
   * @cckParity A native attribute of the element.
   * @defaultValue false
   */
  readonly hidden?: boolean | undefined;
  /** Whether the user left the control. When not set, the control sets it after the first blur. */
  readonly touched?: boolean | undefined;
  /** Whether the user changed the control. When not set, the control sets it after the first change. */
  readonly dirty?: boolean | undefined;
  /**
   * Whether the user tried to submit the form of the control. Bind it to the submit state of your forms library.
   * When not set, a `submit` event of the form sets it, a canceled one too, and a reset clears it.
   */
  readonly submitted?: boolean | undefined;
}
