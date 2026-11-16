'use client';

import { useContext, type ReactElement } from 'react';
import { Textarea as BaseTextarea, type TextareaProps as BaseTextareaProps } from '@cocokits/react/textarea';
import { ThemeOptionsProvider } from '@cocokits/react-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { inherited } from './inherit';
import { FormFieldThemeContext } from './theme-contexts';

type TextareaOptions = CocokitsThemeConfig['components']['textarea'];

/** The `size` values of the cocokits theme. */
export type TextareaSize = TextareaOptions['size']['values'][number];
/** The `autoResize` values of the cocokits theme. */
export type TextareaAutoResize = TextareaOptions['autoResize']['values'][number];
/** The `resize` values of the cocokits theme. */
export type TextareaResize = TextareaOptions['resize']['values'][number];

/** Props of the themed {@link Textarea}: the base props plus the three cocokits options. */
export interface TextareaProps extends BaseTextareaProps {
  /**
   * Padding and text of the textarea. Inside a `FormField` it takes the size of the field.
   */
  readonly size?: TextareaSize | null | undefined;
  /**
   * Grows with its content between the min and max rows.
   */
  readonly autoResize?: TextareaAutoResize | null | undefined;
  /**
   * Shows the handle that resizes the height. It has no effect with `autoResize`.
   */
  readonly resize?: TextareaResize | null | undefined;
}

function ThemedTextarea({ size, autoResize, resize, ...props }: TextareaProps): ReactElement {
  const field = useContext(FormFieldThemeContext);
  return (
    <ThemeOptionsProvider componentName="textarea" options={{ size: inherited(size, field.size), autoResize, resize }}>
      <BaseTextarea {...props} />
    </ThemeOptionsProvider>
  );
}

/** The themed {@link Textarea} component and its `displayName`. */
interface TextareaComponent {
  (props: TextareaProps): ReactElement;
  displayName: string;
}

/**
 * The cocokits Textarea. It renders the base `<textarea>` and supplies `size`, `autoResize` and `resize` to it,
 * which render `data-size` and, when true, `data-auto-resize` and `data-resize`. Each option resolves in order: the
 * prop, then (for `size`) the size of the `FormField` around it, then the `ThemeProvider` override, then the config
 * default; `null` removes the attribute. The theme needs a `ThemeProvider`.
 *
 * @example
 * <Textarea autoResize />
 * @cckPart root
 */
export const Textarea: TextareaComponent = Object.assign(ThemedTextarea, { displayName: 'Textarea' });
