import type { ComponentPropsWithRef, HTMLAttributes, ReactNode, RefCallback } from 'react';
import type { FormFieldState as ResolvedFormFieldState } from '@cocokits/machines/form-field';
import type { RenderProp } from '../internal/render-element';

/**
 * The state of the FormField that the function form of `render` receives: `disabled`, `readOnly`, `required`,
 * `invalid`, `pending`, `touched`, `dirty`, `submitted`, `focused`, `filled` and `hidden`. It joins the props of the
 * field with the state of its control.
 */
export type FormFieldState = ResolvedFormFieldState;

/**
 * The props that the function form of `render` receives: the native `div` props merged with the props of the
 * FormField. Pass all of them, `ref` and `children` included, to one element.
 */
export interface FormFieldRenderProps extends Omit<HTMLAttributes<HTMLElement>, 'color' | 'children' | 'prefix'> {
  /** The merged ref: the `ref` of the FormField and the `ref` of the rendered element. */
  readonly ref: RefCallback<HTMLElement>;
  /** The places of the field, with the label, the control, the zones, the hints and the errors. */
  readonly children: ReactNode;
}

/** Props of the {@link FormField}. Native `div` props pass through, and `ref` reaches the element. */
export interface FormFieldProps extends Omit<ComponentPropsWithRef<'div'>, 'color' | 'children' | 'prefix'> {
  /**
   * The id that the ids of the control and the feedback start from, such as `<id>-control`. When not set, the field
   * makes an id, which the root does not render.
   */
  readonly id?: string | undefined;
  /**
   * The label of the control: a `Label`. When not set, the field shows no label, so name the control in another way.
   *
   * @example
   * <FormField label={<Label>Email address</Label>}>
   *   <Input type="email" />
   * </FormField>
   */
  readonly label?: ReactNode;
  /**
   * Whether the control is disabled. The `disabled` of the control, a disabled `fieldset` or a form library can also
   * disable it.
   *
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * Whether the control is read-only.
   *
   * @defaultValue false
   */
  readonly readOnly?: boolean | undefined;
  /**
   * Whether the control must have a value before the form can submit. The `Label` then shows its required marker.
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
   * Whether the required marker of the `Label` is hidden. It does not change `required`.
   *
   * @defaultValue false
   */
  readonly hideRequiredMarker?: boolean | undefined;
  /**
   * The control of the field, such as an `Input` or a `Textarea`. The field holds one control. When not set, the
   * field has no control.
   *
   * @example
   * <FormField label={<Label>Message</Label>}>
   *   <Textarea />
   * </FormField>
   */
  readonly children?: ReactNode;
  /**
   * The help texts under the control: one or more `Hint` elements, or plain text. When not set, the field shows no
   * help text.
   *
   * Plain text renders in a `Hint`. Put each `Hint` directly in the prop. Any other content, such as a `<span>`, a
   * wrapper or a component that renders a `Hint`, does not describe the control. In development, the field then
   * warns once.
   *
   * @example
   * <FormField label={<Label>Email address</Label>} hint={<Hint>We never share it.</Hint>}>
   *   <Input type="email" />
   * </FormField>
   */
  readonly hint?: ReactNode;
  /**
   * The content before the box, outside it: a `Leading`. When not set, nothing shows there.
   *
   * @example
   * <FormField label={<Label>Search</Label>} leading={<Leading>Find</Leading>}>
   *   <Input type="search" />
   * </FormField>
   */
  readonly leading?: ReactNode;
  /**
   * The content in the box, before the control: a `Prefix`. When not set, nothing shows there.
   *
   * It takes the place of the `prefix` text attribute of the native element, which the root does not take.
   *
   * @example
   * <FormField label={<Label>Price</Label>} prefix={<Prefix>$</Prefix>}>
   *   <Input type="number" />
   * </FormField>
   */
  readonly prefix?: ReactNode;
  /**
   * The content in the box, after the control: a `Suffix`. When not set, nothing shows there.
   *
   * @example
   * <FormField label={<Label>Weight</Label>} suffix={<Suffix>kg</Suffix>}>
   *   <Input type="number" />
   * </FormField>
   */
  readonly suffix?: ReactNode;
  /**
   * The content after the box, outside it: a `Trailing`. When not set, nothing shows there.
   *
   * @example
   * <FormField label={<Label>Code</Label>} trailing={<Trailing>6 digits</Trailing>}>
   *   <Input />
   * </FormField>
   */
  readonly trailing?: ReactNode;
  /**
   * The errors of the field, after the hints: one or more `FieldError` elements, or plain text. When not set, the
   * field shows no error.
   *
   * Plain text renders in a `FieldError` that always shows. Put each `FieldError` directly in the prop. Any other
   * content, such as a `<span>`, a wrapper or a component that renders a `FieldError`, does not describe the
   * control. In development, the field then warns once.
   *
   * @example
   * <FormField
   *   label={<Label>Email address</Label>}
   *   invalid
   *   error={<FieldError>Enter an email address.</FieldError>}
   * >
   *   <Input type="email" />
   * </FormField>
   */
  readonly error?: ReactNode;
  /**
   * Replaces the `<div>` of the FormField. Pass an element, or a function of the merged props and the
   * {@link FormFieldState}. The function must pass all props on, `ref` and `children` included, to one element.
   *
   * When not set, the FormField renders a `<div>`. The FormField replaces the children of the element with its own.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   */
  readonly render?: RenderProp<FormFieldRenderProps, FormFieldState> | undefined;
}
