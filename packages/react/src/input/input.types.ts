import type { ComponentPropsWithRef } from 'react';
import type { InputType } from '@cocokits/machines/input';
import type { ChangeDetails } from '@cocokits/shared';

/** Why the value of an Input changed: the user typed (`'user'`) or the owner form was reset (`'form-reset'`). */
export type InputChangeReason = 'user' | 'form-reset';

/** What `onValueChange` receives besides the value: the reason and the event behind it. */
export type InputChangeDetails = ChangeDetails<InputChangeReason>;

/**
 * Props of the {@link Input}. Native `input` attributes pass through to the root and `ref` reaches
 * the `input`. The element is fixed, so there is no `render`. Native `onChange`, `onFocus` and
 * `onBlur` run before the Input's own handlers.
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
  /** The `id`. Inside a FormField it defaults to `<fieldId>-control`; an explicit value wins and the Label follows it. */
  readonly id?: string | undefined;
  /**
   * Disables the control. A disabling `fieldset` and the field's `disabled` add to it.
   *
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * Makes the control read-only; it stays focusable.
   *
   * @defaultValue false
   */
  readonly readOnly?: boolean | undefined;
  /**
   * Makes the control required (native `required`).
   *
   * @defaultValue false
   */
  readonly required?: boolean | undefined;
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
  /** Whether the user left the control. Given, it wins; otherwise it is set after the first blur. */
  readonly touched?: boolean | undefined;
  /** Whether the user edited the control. Given, it wins; otherwise it is set after the first edit. */
  readonly dirty?: boolean | undefined;
  /**
   * Whether a submit of the owner form was attempted. Given, it wins (bind it to the forms library's submit
   * state); otherwise a `submit` event of the form sets it, canceled ones included, and a reset clears it.
   */
  readonly submitted?: boolean | undefined;
  /**
   * The text type; any value outside these six renders `text`.
   *
   * @cckSemantic none
   * @cckParity A native attribute of the element.
   * @defaultValue 'text'
   */
  readonly type?: InputType | undefined;
  /**
   * The name `FormData` submits. With react-hook-form, `register('email')` passes it.
   *
   * @cckSemantic none
   * @cckParity A native attribute of the element.
   */
  readonly name?: string | undefined;
  /**
   * Hides the control (native `hidden`).
   *
   * @cckSemantic none
   * @cckParity A native attribute of the element.
   */
  readonly hidden?: boolean | undefined;
  /**
   * The ids this control is described by. Inside a FormField the feedback wrapper id is added after them.
   *
   * @cckSemantic input.ariaDescribedBy
   * @cckParity Spelled as the native `aria-describedby` attribute.
   */
  readonly 'aria-describedby'?: string | undefined;
  /**
   * The text, which makes the Input controlled: `null` is the controlled empty value, and `undefined`
   * leaves the Input uncontrolled. A parent that does not update it after `onValueChange` keeps the old text.
   */
  readonly value?: string | null | undefined;
  /**
   * The initial text of an uncontrolled Input. The DOM is the source, so a value written through
   * the ref (react-hook-form `register()`) stays across renders. A form reset restores it.
   *
   * @defaultValue ''
   *
   * @cckSemantic none
   * @cckParity The uncontrolled start value.
   */
  readonly defaultValue?: string | undefined;
  /**
   * Called after every change the user makes (also while composing with an IME) and after a reset
   * of the owner form; never when the parent sets `value`.
   *
   * @cckSemantic input.valueChange
   * @cckParity The change callback of this component.
   */
  readonly onValueChange?: ((value: string, details: InputChangeDetails) => void) | undefined;
}
