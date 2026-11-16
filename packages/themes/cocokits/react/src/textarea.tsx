'use client';

import type { ReactElement } from 'react';
import { Textarea as BaseTextarea, type TextareaProps as BaseTextareaProps } from '@cocokits/react/textarea';
import { ThemeOptionsProvider } from '@cocokits/react-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type TextareaOptions = CocokitsThemeConfig['components']['textarea'];

/** The `autoResize` values of the cocokits theme. */
export type TextareaAutoResize = TextareaOptions['autoResize']['values'][number];
/** The `resize` values of the cocokits theme. */
export type TextareaResize = TextareaOptions['resize']['values'][number];

/** Props of the themed {@link Textarea}: the base props plus the two cocokits options. */
export interface TextareaProps extends BaseTextareaProps {
  /**
   * Grows with its content between the min and max rows.
   */
  readonly autoResize?: TextareaAutoResize | null | undefined;
  /**
   * Shows the handle that resizes the height. It has no effect with `autoResize`.
   */
  readonly resize?: TextareaResize | null | undefined;
}

function ThemedTextarea({ autoResize, resize, ...props }: TextareaProps): ReactElement {
  return (
    <ThemeOptionsProvider componentName="textarea" options={{ autoResize, resize }}>
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
 * The cocokits Textarea. It renders the base `<textarea>` and supplies `autoResize` and `resize` to it, which
 * render `data-auto-resize` and `data-resize` when true. Each option resolves in order: the prop, then the `ThemeProvider` override,
 * then the config default; `null` removes the attribute. The theme needs a `ThemeProvider`.
 *
 * @example
 * <Textarea autoResize />
 * @cckPart root
 */
export const Textarea: TextareaComponent = Object.assign(ThemedTextarea, { displayName: 'Textarea' });
