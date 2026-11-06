import type { Component } from 'vue';
import type { AsTag } from '@cocokits/vue-core';

/**
 * Lays out a label, a control, its zones and its hints in fixed places. It renders a `<div>` by default
 * and puts the `label` slot first; inside the wrapper the `leading` slot, then the input wrapper (the `prefix`
 * slot, the default slot (the control), the `suffix` slot), then the `trailing` slot; and the `hint` and `error`
 * slots last, whatever order the author writes them in.
 *
 * A click on the box (its padding, a prefix or a suffix) focuses the control, unless it lands on interactive
 * content, on a disabled control or after selecting text.
 *
 * It wires a control for you. The field has an id (your `id`, or a generated one); the control
 * (an Input or a Textarea) gets `<id>-control`, the Label's `for` points at it, and the control's
 * `aria-describedby` ends with the feedback wrapper's `<id>-feedback`, so every hint and error describes the control. An `id`, `for` or `aria-describedby` you
 * write wins or comes first. `disabled`, `readonly`, `required` and `invalid` reach the control, and the facts
 * of the control (those and `touched`, `dirty`, `submitted`, `focused`, `filled`, `pending`) are `data-*`
 * attributes on the root. A control that is not a CocoKits control gets none of this: give it an `id`, give
 * the Label the same `for`, and add the hint ids to its `aria-describedby`. The field holds one control.
 * Native attributes fall through to the root.
 *
 * @example
 * <FormField required><template #label><Label>Email</Label></template><Input v-model="email" /></FormField>
 *
 * @cckPart root
 */
export interface FormFieldProps {
  /**
   * The id the control and feedback ids start from (`<id>-control`, `<id>-feedback`). Leave it out for a
   * generated one, which the root does not render.
   */
  readonly id?: string | undefined;
  /**
   * Disables the control. The control's own `disabled`, a disabling `fieldset` or a forms library add to it.
   *
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * Makes the control read-only.
   *
   * @cckSemantic form-field.readOnly
   * @cckParity Vue spells it as the native `readonly` attribute.
   * @defaultValue false
   */
  readonly readonly?: boolean | undefined;
  /**
   * Makes the control required, and shows the Label's required marker.
   *
   * @defaultValue false
   */
  readonly required?: boolean | undefined;
  /**
   * Marks the control invalid. `aria-invalid` waits until the control was touched or the form submitted.
   *
   * @defaultValue false
   */
  readonly invalid?: boolean | undefined;
  /**
   * Hides the required marker of the Label. It does not change `required`.
   *
   * @defaultValue false
   */
  readonly hideRequiredMarker?: boolean | undefined;
  /**
   * Hides the field (native `hidden`). The root is also hidden while the control is hidden, and a `false` here
   * never shows it again.
   *
   * @cckSemantic none
   * @cckParity Vue and Angular declare it, so a `false` cannot unhide the root; React takes the native attribute.
   * @defaultValue false
   */
  readonly hidden?: boolean | undefined;
  /**
   * The tag or component to render.
   *
   * @cckSemantic none
   * @cckParity Vue's element override (Reka).
   * @defaultValue 'div'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the FormField merges its attributes onto the one element or component child of its
   * default slot instead of rendering an element. The FormField renders the label zone, the control
   * zone and the hint zone inside the child; the own children of the child become the control.
   *
   * @cckSemantic none
   * @cckParity Vue's merge onto one child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}
