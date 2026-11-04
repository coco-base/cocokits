'use client';

import type { ReactElement } from 'react';
import { Textarea as BaseTextarea, type TextareaProps as BaseTextareaProps } from '@cocokits/react/textarea';
import { ThemeOptionsProvider } from '@cocokits/react-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type TextareaOptions = CocokitsThemeConfig['components']['textarea'];

/** The `autoResize` values of the cocokits theme. */
export type TextareaAutoResize = TextareaOptions['autoResize']['values'][number];

/** Props of the themed {@link Textarea}: the base props plus the cocokits `autoResize`. */
export interface TextareaProps extends BaseTextareaProps {
  /**
   * Grows with its content between the min and max rows.
   */
  readonly autoResize?: TextareaAutoResize | null | undefined;
}

function ThemedTextarea({ autoResize, ...props }: TextareaProps): ReactElement {
  return (
    <ThemeOptionsProvider componentName="textarea" options={{ autoResize }}>
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
 * The cocokits Textarea. It renders the base `<textarea>` and supplies `autoResize` to it, which renders
 * `data-auto-resize` when true. The option resolves in order: the prop, then the `ThemeProvider` override,
 * then the config default; `null` removes the attribute. The theme needs a `ThemeProvider`.
 *
 * @example
 * <Textarea autoResize />
 * @cckPart root
 */
export const Textarea: TextareaComponent = Object.assign(ThemedTextarea, { displayName: 'Textarea' });
