'use client';

import type { ReactElement } from 'react';
import { Button as BaseButton, type ButtonProps as BaseButtonProps } from '@cocokits/react/button';
import { ThemeOptionsProvider } from '@cocokits/react-core';
import type { FramesThemeConfig } from '@cocokits/theme-frames-x';

type ButtonOptions = FramesThemeConfig['components']['button'];

/** The `variant` values of the Frames X theme. */
export type ButtonVariant = ButtonOptions['variant']['values'][number];

/** Props of the themed {@link Button}: the base props plus the Frames X `variant` option. */
export interface ButtonProps extends BaseButtonProps {
  /** Fill and border style. */
  readonly variant?: ButtonVariant | null | undefined;
}

function ThemedButton({ variant, ...props }: ButtonProps): ReactElement {
  return (
    <ThemeOptionsProvider componentName="button" options={{ variant }}>
      <BaseButton {...props} />
    </ThemeOptionsProvider>
  );
}

/** The themed {@link Button} component and its `displayName`. */
interface ButtonComponent {
  (props: ButtonProps): ReactElement;
  displayName: string;
}

/**
 * The Frames X Button. It renders a `<button>`, or a link with `render` and `nativeButton={false}`,
 * and supplies `variant` to the base Button, which renders the `data-*` attribute. The option
 * resolves in order: the prop, then the `ThemeProvider` override, then the config default; `null`
 * removes the attribute. The theme needs a `ThemeProvider`.
 *
 * The name is its content. An icon-only Button needs `aria-label` or `aria-labelledby`.
 *
 * @example
 * <Button variant="outline">Delete</Button>
 * @cckPart root
 */
export const Button: ButtonComponent = Object.assign(ThemedButton, { displayName: 'Button' });
