import type { ComponentPropsWithRef } from 'react';
import type { InputType } from '@cocokits/machines/input';
import type { ChangeDetails } from '@cocokits/shared';

/**
 * Why the value of an Input changed.
 *
 * @cckValue user - The user typed, pasted or deleted text.
 * @cckValue form-reset - The form of the Input was reset.
 */
export type InputChangeReason = 'user' | 'form-reset';

/** What `onValueChange` receives besides the value: the `reason` and the `event` behind the change. */
export type InputChangeDetails = ChangeDetails<InputChangeReason>;

/**
 * Props of the {@link Input}. Native `input` props pass through, and `ref` reaches the element. The element is always
 * an `<input>`, so there is no `render`.
 *
 * Native `onChange`, `onFocus` and `onBlur` run before the handlers of the Input.
 */
export interface InputProps extends Omit<
  ComponentPropsWithRef<'input'>,
  | 'color'
  | 'children'
  | 'value'
  | 'defaultValue'
  | 'type'
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
   * The kind of text that the Input takes. Any other value renders `text`.
   *
   * @cckSemantic none
   * @cckParity A native attribute of the element.
   * @defaultValue 'text'
   */
  readonly type?: InputType | undefined;
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
   * @cckSemantic input.ariaDescribedBy
   * @cckParity Spelled as the native `aria-describedby` attribute.
   */
  readonly 'aria-describedby'?: string | undefined;
  /**
   * The text of the Input. Setting it makes the Input controlled, and `null` is an empty text. If you do not update
   * it after `onValueChange`, the old text stays.
   *
   * When not set, the Input keeps its own text, which starts as `defaultValue`.
   */
  readonly value?: string | null | undefined;
  /**
   * The start text of an Input that you do not control with `value`. The DOM holds the text, so a text that
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
   * const [text, setText] = useState('');
   * <Input aria-label="Email" value={text} onValueChange={(value) => setText(value)} />
   *
   * @cckSemantic input.valueChange
   * @cckParity The change callback of this component.
   */
  readonly onValueChange?: ((value: string, details: InputChangeDetails) => void) | undefined;
}
