'use client';

import type { ReactElement } from 'react';
import { FormField as BaseFormField, type FormFieldProps as BaseFormFieldProps } from '@cocokits/react/form-field';
import { ThemeOptionsProvider } from '@cocokits/react-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type FormFieldOptions = CocokitsThemeConfig['components']['form-field'];

/** The `size` values of the cocokits theme. */
export type FormFieldSize = FormFieldOptions['size']['values'][number];
/** The `width` values of the cocokits theme. */
export type FormFieldWidth = FormFieldOptions['width']['values'][number];

/** Props of the themed {@link FormField}: the base props plus the two cocokits options. */
export interface FormFieldProps extends BaseFormFieldProps {
  /**
   * Height, padding and text size of the input box.
   */
  readonly size?: FormFieldSize | null | undefined;
  /**
   * Width of the field. Without it the field keeps the width its layout gives it.
   */
  readonly width?: FormFieldWidth | null | undefined;
}

function ThemedFormField({ size, width, ...props }: FormFieldProps): ReactElement {
  return (
    <ThemeOptionsProvider componentName="form-field" options={{ size, width }}>
      <BaseFormField {...props} />
    </ThemeOptionsProvider>
  );
}

/** The themed {@link FormField} component and its `displayName`. */
interface FormFieldComponent {
  (props: FormFieldProps): ReactElement;
  displayName: string;
}

/**
 * The cocokits FormField. It lays out a label, a control and its hints, and supplies `size` and `width` to
 * the base FormField, which renders `data-size` on the root and on the input wrapper and `data-width` on the
 * root. Each option
 * resolves in order: the prop, then the `ThemeProvider` override, then the config default; `null`
 * removes the attribute. The theme needs a `ThemeProvider`.
 *
 * @example
 * <FormField size="lg" label={<Label>Email</Label>}><Input type="email" /></FormField>
 * @cckPart root
 */
export const FormField: FormFieldComponent = Object.assign(ThemedFormField, { displayName: 'FormField' });
