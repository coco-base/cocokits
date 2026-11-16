'use client';

import { useContext, type ReactElement } from 'react';
import { Input as BaseInput, type InputProps as BaseInputProps } from '@cocokits/react/input';
import { ThemeOptionsProvider } from '@cocokits/react-core';
import { inherited, type CocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { FormFieldThemeContext } from './theme-contexts';

type InputOptions = CocokitsThemeConfig['components']['input'];

/** The `size` values of the cocokits theme. */
export type InputSize = InputOptions['size']['values'][number];

/** Props of the themed {@link Input}: the base props plus the cocokits `size` (it replaces the native `size`). */
export interface InputProps extends Omit<BaseInputProps, 'size'> {
  /**
   * Height, padding and text of the input. Inside a `FormField` it takes the size of the field.
   */
  readonly size?: InputSize | null | undefined;
}

function ThemedInput({ size, ...props }: InputProps): ReactElement {
  const field = useContext(FormFieldThemeContext);
  return (
    <ThemeOptionsProvider componentName="input" options={{ size: inherited(size, field.size) }}>
      <BaseInput {...props} />
    </ThemeOptionsProvider>
  );
}

/** The themed {@link Input} component and its `displayName`. */
interface InputComponent {
  (props: InputProps): ReactElement;
  displayName: string;
}

/**
 * The cocokits Input. It renders the base `<input>` and supplies `size` to it, which renders `data-size`. The option
 * resolves in order: the prop, then the size of the `FormField` around it, then the `ThemeProvider` override, then the
 * config default; `null` removes the attribute. The theme needs a `ThemeProvider`.
 *
 * @example
 * <Input size="lg" aria-label="Name" />
 * @cckPart root
 */
export const Input: InputComponent = Object.assign(ThemedInput, { displayName: 'Input' });
