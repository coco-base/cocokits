'use client';

import type { ReactElement } from 'react';
import { Button as BaseButton, type ButtonProps as BaseButtonProps } from '@cocokits/react/button';
import { ThemeOptionsProvider } from '@cocokits/react-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type ButtonOptions = CocokitsThemeConfig['components']['button'];

/** The `variant` values of the cocokits theme. */
export type ButtonVariant = ButtonOptions['variant']['values'][number];
/** The `color` values of the cocokits theme. */
export type ButtonColor = ButtonOptions['color']['values'][number];
/** The `size` values of the cocokits theme. */
export type ButtonSize = ButtonOptions['size']['values'][number];

/** Props of the themed {@link Button}: the base props plus the three cocokits options. */
export interface ButtonProps extends BaseButtonProps {
  /**
   * Fill and border style.
   */
  readonly variant?: ButtonVariant | null | undefined;
  /**
   * Color family, rendered as `data-cck-color`.
   */
  readonly color?: ButtonColor | null | undefined;
  /**
   * Minimum height, padding and text size.
   */
  readonly size?: ButtonSize | null | undefined;
}

function ThemedButton({ variant, color, size, ...props }: ButtonProps): ReactElement {
  return (
    <ThemeOptionsProvider componentName="button" options={{ variant, color, size }}>
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
 * The cocokits Button. It renders a `<button>`, or a link with `render` and `nativeButton={false}`,
 * and supplies `variant`, `color` and `size` to the base Button, which renders the `data-*`
 * attributes. Each option resolves in order: the prop, then the `ThemeProvider` override, then the
 * config default; `null` removes the attribute. The theme needs a `ThemeProvider`.
 *
 * The name is its content. An icon-only Button needs `aria-label` or `aria-labelledby`.
 *
 * @example
 * <Button variant="outline" color="danger" size="lg">Delete</Button>
 * @cckPart root
 */
export const Button: ButtonComponent = Object.assign(ThemedButton, { displayName: 'Button' });
