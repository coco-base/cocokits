import type { ComponentPropsWithRef, HTMLAttributes, ReactNode, RefCallback } from 'react';
import type { FormFieldState as ResolvedFormFieldState } from '@cocokits/machines/form-field';
import type { RenderProp } from '../internal/render-element';

/**
 * The public state of the FormField, passed to the function form of `render`: the resolved facts
 * (`disabled`, `readOnly`, `required`, `invalid`, `pending`, `touched`, `dirty`, `submitted`, `focused`,
 * `filled`, `hidden`). The field's own props and the registered control's facts are combined.
 */
export type FormFieldState = ResolvedFormFieldState;

/**
 * The props the function form of `render` receives: the native div props, merged with the
 * FormField's own. Spread all of them, including `ref` and `children`, onto one element.
 */
export interface FormFieldRenderProps extends Omit<HTMLAttributes<HTMLElement>, 'color' | 'children' | 'prefix'> {
  /** The merged ref: the FormField's `ref`, and the rendered element's own `ref`. */
  readonly ref: RefCallback<HTMLElement>;
  /** The zones. */
  readonly children: ReactNode;
}

/**
 * Props of the {@link FormField}. Native `div` attributes pass through to the root, and `ref`
 * reaches it.
 */
export interface FormFieldProps extends Omit<ComponentPropsWithRef<'div'>, 'color' | 'children' | 'prefix'> {
  /**
   * The id the control and feedback ids start from (`<id>-control`, `<id>-feedback`). Leave it out for a
   * generated one, which the root does not render.
   */
  readonly id?: string | undefined;
  /** The label of the control. */
  readonly label?: ReactNode;
  /**
   * Disables the control. The control's own `disabled`, a disabling `fieldset` or a forms library add to it.
   *
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * Makes the control read-only.
   *
   * @defaultValue false
   */
  readonly readOnly?: boolean | undefined;
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
  /** The control. */
  readonly children?: ReactNode;
  /** The hints. */
  readonly hint?: ReactNode;
  /** Content outside the box, before it: a `Leading`. */
  readonly leading?: ReactNode;
  /**
   * Content inside the box, before the control: a `Prefix`. It replaces the RDFa `prefix` string attribute of
   * the native element, which the root no longer accepts.
   */
  readonly prefix?: ReactNode;
  /** Content inside the box, after the control: a `Suffix`. */
  readonly suffix?: ReactNode;
  /** Content outside the box, after it: a `Trailing`. */
  readonly trailing?: ReactNode;
  /**
   * The field errors, after the hints: a `FieldError`. Pass the component, not a bare string, so the
   * message sits in the live region.
   */
  readonly error?: ReactNode;
  /**
   * Replaces the rendered `<div>`: an element, or a function of the merged props and the
   * {@link FormFieldState}. The element form (its own children are replaced by the zones) works from a
   * Server Component; the function form does not (a function is not serialisable). The function
   * form must spread all the props it receives, including `ref` and `children`, onto one element.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   */
  readonly render?: RenderProp<FormFieldRenderProps, FormFieldState> | undefined;
}
