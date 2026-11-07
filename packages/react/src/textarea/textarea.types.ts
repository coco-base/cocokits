import type { ComponentPropsWithRef } from 'react';
import type { ChangeDetails } from '@cocokits/shared';

/**
 * Why the value of a Textarea changed.
 *
 * @cckValue user - The user typed, pasted or deleted text.
 * @cckValue form-reset - The form of the Textarea was reset.
 */
export type TextareaChangeReason = 'user' | 'form-reset';

/** What `onValueChange` receives besides the value: the `reason` and the `event` behind the change. */
export type TextareaChangeDetails = ChangeDetails<TextareaChangeReason>;

/**
 * Props of the {@link Textarea}. Native `textarea` props such as `rows` and `placeholder` pass through, and `ref`
 * reaches the element. The element is always a `<textarea>`, so there is no `render` and no `children`.
 *
 * Native `onChange`, `onFocus` and `onBlur` run before the handlers of the Textarea.
 */
export interface TextareaProps extends Omit<
  ComponentPropsWithRef<'textarea'>,
  | 'color'
  | 'children'
  | 'value'
  | 'defaultValue'
  | 'id'
  | 'name'
  | 'disabled'
  | 'readOnly'
  | 'required'
  | 'hidden'
  | 'aria-describedby'
> {
  /**
   * The `id` of the element. An `id` you write wins, and the `Label` follows it. When not set, the control inside a
   * `FormField` gets `<fieldId>-control`.
   */
  readonly id?: string | undefined;
  /**
   * Whether the control is disabled. A disabled `fieldset` around it, or a disabled `FormField`, also disables it.
   *
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * Whether the control is read-only. The user can focus it and select its text, but cannot change it.
   *
   * @defaultValue false
   */
  readonly readOnly?: boolean | undefined;
  /**
   * Whether the control must have a value before the form can submit. It sets the native `required`.
   *
   * @defaultValue false
   */
  readonly required?: boolean | undefined;
  /**
   * Whether the value is not valid. The control gets `aria-invalid` only after the user has left it or has tried to
   * submit the form.
   *
   * @defaultValue false
   */
  readonly invalid?: boolean | undefined;
  /**
   * Whether an async check of the value is running.
   *
   * @defaultValue false
   */
  readonly pending?: boolean | undefined;
  /**
   * Whether the user has left the control. A value you pass wins. When not set, the control sets it after the first
   * blur.
   */
  readonly touched?: boolean | undefined;
  /**
   * Whether the user has changed the text. A value you pass wins. When not set, the control sets it after the first
   * change.
   */
  readonly dirty?: boolean | undefined;
  /**
   * Whether the user has tried to submit the form. A value you pass wins, so you can bind the submit state of a
   * form library.
   *
   * When not set, a `submit` event of the form sets it, also a canceled one, and a form reset clears it.
   */
  readonly submitted?: boolean | undefined;
  /**
   * The name that `FormData` sends. With react-hook-form, `register('email')` passes it. When not set, the form does
   * not send the control.
   *
   * @cckSemantic none
   * @cckParity A native attribute of the element.
   */
  readonly name?: string | undefined;
  /**
   * Whether the control is hidden. It sets the native `hidden`. When not set, the control shows.
   *
   * @cckSemantic none
   * @cckParity A native attribute of the element.
   */
  readonly hidden?: boolean | undefined;
  /**
   * The ids of the elements that describe the control. Inside a `FormField`, the ids of its hints and then of its
   * errors follow them. When not set, only the field describes the control.
   *
   * @cckSemantic textarea.ariaDescribedBy
   * @cckParity Spelled as the native `aria-describedby` attribute.
   */
  readonly 'aria-describedby'?: string | undefined;
  /**
   * The text of the Textarea. Setting it makes the Textarea controlled, and `null` is an empty text. If you do not update
   * it after `onValueChange`, the old text stays.
   *
   * When not set, the Textarea keeps its own text, which starts as `defaultValue`.
   */
  readonly value?: string | null | undefined;
  /**
   * The start text of a Textarea that you do not control with `value`. The DOM holds the text, so a text that
   * react-hook-form `register()` writes through the ref stays. A form reset restores it.
   *
   * @defaultValue ''
   *
   * @cckSemantic none
   * @cckParity The uncontrolled start value.
   */
  readonly defaultValue?: string | undefined;
  /**
   * Called after the user changes the text, also while composing with an input method, and after a form reset. It
   * receives the new text and a details object with the `reason` and the `event`.
   *
   * It is never called when you change `value` yourself.
   *
   * @example
   * <Textarea aria-label="Message" value={text} onValueChange={(value) => setText(value)} />
   *
   * @cckSemantic textarea.valueChange
   * @cckParity The change callback of this component.
   */
  readonly onValueChange?: ((value: string, details: TextareaChangeDetails) => void) | undefined;
}
