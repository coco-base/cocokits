import type { ComponentPropsWithRef } from 'react';
import type { ChangeDetails } from '@cocokits/shared';

/** Why the value of a Textarea changed: the user typed (`'user'`) or the owner form was reset (`'form-reset'`). */
export type TextareaChangeReason = 'user' | 'form-reset';

/** What `onValueChange` receives besides the value: the reason and the event behind it. */
export type TextareaChangeDetails = ChangeDetails<TextareaChangeReason>;

/**
 * Props of the {@link Textarea}. Native `textarea` attributes (`rows`, `cols`, `wrap`, `placeholder`, ...) pass
 * through to the root and `ref` reaches the `textarea`. The element is fixed, so there is no `render`, and
 * `children` is not accepted. Native `onChange`, `onFocus` and `onBlur` run before the Textarea's own handlers.
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
   * @cckSemantic textarea.ariaDescribedBy
   * @cckParity Spelled as the native `aria-describedby` attribute.
   */
  readonly 'aria-describedby'?: string | undefined;
  /**
   * The text, which makes the Textarea controlled: `null` is the controlled empty value, and `undefined`
   * leaves the Textarea uncontrolled. A parent that does not update it after `onValueChange` keeps the old text.
   */
  readonly value?: string | null | undefined;
  /**
   * The initial text of an uncontrolled Textarea. The DOM is the source, so a value written through
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
   * @cckSemantic textarea.valueChange
   * @cckParity The change callback of this component.
   */
  readonly onValueChange?: ((value: string, details: TextareaChangeDetails) => void) | undefined;
}
