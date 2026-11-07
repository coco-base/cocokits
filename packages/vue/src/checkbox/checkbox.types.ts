import type { CheckControlProps } from '../internal/check-control.types';

/**
 * A checkbox around a native `<input type="checkbox">` with its label. It renders a `<div>`, and the content you
 * write becomes the label. Bind the value with `v-model`.
 *
 * The input is the form control, so `FormData`, `required`, reset, the `form` attribute and `fieldset[disabled]` are
 * native. Other native input attributes and listeners, such as `form` and `onFocus`, go to the `<input>`. `class`,
 * `style` and `hidden` stay on the root, and `role` is reserved.
 *
 * Inside a FormField, the input gets the id `<fieldId>-control`, and the `for` of the field Label points at it. Its
 * `aria-describedby` ends with the ids of the hints of the field, then of its errors. `aria-invalid="true"` appears
 * only while the control is invalid and was touched, or the form was submitted.
 *
 * `indeterminate` goes one way: the component never changes it. A parent that owns the mixed state computes it again
 * in its `update:modelValue` handler.
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
   * Whether the checkbox shows the mixed state. The component never changes it and never emits for it.
   * `data-indeterminate` renders on the server, and the DOM property is set after mount.
   *
   * @defaultValue false
   */
  readonly indeterminate?: boolean | undefined;
  /**
   * Whether the checkbox is checked, bound with `v-model`. `null` renders unchecked. When not set, the Checkbox
   * keeps its own value, which starts as `defaultChecked`.
   *
   * If you listen for changes and do not accept one, the old value stays.
   *
   * @cckSemantic checkbox.checked
   * @cckParity Bound with `v-model`.
   * @defaultValue false
   */
  readonly modelValue?: boolean | null | undefined;
  /**
   * The modifiers of `v-model`, as in `v-model.trim`. The framework fills it. The component declares it so the
   * modifiers do not reach the native element.
   *
   * @internal
   * @cckSemantic none
   * @cckParity Only this framework has this member.
   */
  readonly modelModifiers?: Record<string, true> | undefined;
  /**
   * The start checked state of a Checkbox whose `v-model` is not bound. It is read once, when the Checkbox is created.
   *
   * A bound `modelValue` ignores it, with or without a listener. A listener on `update:modelValue` alone reports the
   * changes and does not make the Checkbox controlled.
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
   * Emits the new checked value for `v-model` when the user changes it and when the form of the control resets.
   * It is the only change event, and it carries the value only.
   *
   * @cckSemantic checkbox.checkedChange
   * @cckParity The `update:modelValue` event is the only change event; it carries the value only.
   */
  'update:modelValue': [checked: boolean];
}
