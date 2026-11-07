import type { CheckControlProps } from '../internal/check-control.types';

/**
 * A checkbox around a native `<input type="checkbox">` with its label. The root is a `<div>` by default and the
 * content you write becomes the label. Bind the value with `v-model`. The input is the form control, so `FormData`,
 * `required`, reset, the `form` attribute and `fieldset[disabled]` are native. Other native input attributes and
 * listeners (`form`, `onFocus`, ...) go to the `<input>`; `class`, `style` and `hidden` stay on the root; `role` is reserved.
 *
 * Inside a FormField the input gets the id `<fieldId>-control`, the field Label's `for` points at it and its
 * `aria-describedby` ends with the field's feedback wrapper. `aria-invalid="true"` appears only while the control is
 * invalid and was touched or the form was submitted.
 *
 * `indeterminate` is one-way: the component never changes it. A parent that owns the mixed state recomputes it in
 * its `update:modelValue` handler.
 *
 * @example
 * <Checkbox v-model="accepted">Accept the terms</Checkbox>
 *
 * @cckPart root
 * @cckPart wrapper
 * @cckPart inputWrapper
 * @cckPart input
 * @cckPart backdrop
 * @cckPart background
 * @cckPart label
 */
export interface CheckboxProps extends CheckControlProps {
  /**
   * Whether the checkbox shows the mixed state. One-way: the component never changes it and never emits for it.
   * `data-indeterminate` renders on the server; the DOM property is set after mount.
   *
   * @defaultValue false
   */
  readonly indeterminate?: boolean | undefined;
  /**
   * Whether the checkbox is checked, bound with `v-model`. `null` and `undefined` render unchecked. Bound with a
   * listener it is controlled: a parent that does not accept a change keeps the old value. Unbound, the Checkbox
   * keeps its own value.
   *
   * @cckSemantic checkbox.checked
   * @cckParity Bound with `v-model`.
   * @defaultValue false
   */
  readonly modelValue?: boolean | null | undefined;
  /**
   * The modifiers of `v-model` (`.trim`, `.number`, ...); the component only declares them so they do not reach the native element.
   *
   * @cckSemantic none
   * @cckParity Only this framework has this member.
   */
  readonly modelModifiers?: Record<string, true> | undefined;
  /**
   * The initial checked state of a Checkbox whose `v-model` is not bound, read once when it is created. Binding `modelValue`,
   * with or without a listener, ignores it. A listener on `update:modelValue` reports the changes of the Checkbox
   * and does not make it controlled.
   *
   * @cckSemantic none
   * @cckParity The value the component starts with.
   * @defaultValue false
   */
  readonly defaultChecked?: boolean | undefined;
}

/** The events of the Checkbox. */
export interface CheckboxEmits {
  /**
   * Emits with the new checked value for `v-model`, after a change the user makes and after a reset of the owner form.
   *
   * @cckSemantic checkbox.checkedChange
   * @remarks The only change event; it carries the value only.
   * @cckParity The `update:modelValue` event is the only change event; it carries the value only.
   */
  'update:modelValue': [checked: boolean];
}
