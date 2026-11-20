'use client';

import type { ReactElement } from 'react';
import { IconButton as BaseIconButton, type IconButtonProps as BaseIconButtonProps } from '@cocokits/react/icon-button';
import { ThemeOptionsProvider } from '@cocokits/react-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type IconButtonOptions = CocokitsThemeConfig['components']['icon-button'];

/** The `variant` values of the cocokits theme. */
export type IconButtonVariant = IconButtonOptions['variant']['values'][number];
/** The `color` values of the cocokits theme. */
export type IconButtonColor = IconButtonOptions['color']['values'][number];
/** The `size` values of the cocokits theme. */
export type IconButtonSize = IconButtonOptions['size']['values'][number];
/** The `rounded` values of the cocokits theme. */
export type IconButtonRounded = IconButtonOptions['rounded']['values'][number];

/** Props of the themed {@link IconButton}: the base props plus the four cocokits options. */
export interface IconButtonProps extends BaseIconButtonProps {
  /**
   * Fill and border style.
   */
  readonly variant?: IconButtonVariant | null | undefined;
  /**
   * Color family, rendered as `data-cck-color`.
   */
  readonly color?: IconButtonColor | null | undefined;
  /**
   * Side of the square and size of the icon.
   */
  readonly size?: IconButtonSize | null | undefined;
  /**
   * Fully round corners (a circle).
   */
  readonly rounded?: IconButtonRounded | null | undefined;
}

function ThemedIconButton({ variant, color, size, rounded, ...props }: IconButtonProps): ReactElement {
  return (
    <ThemeOptionsProvider componentName="icon-button" options={{ variant, color, size, rounded }}>
      <BaseIconButton {...props} />
    </ThemeOptionsProvider>
  );
}

/** The themed {@link IconButton} component and its `displayName`. */
interface IconButtonComponent {
  (props: IconButtonProps): ReactElement;
  displayName: string;
}

/**
 * The cocokits IconButton. It renders a `<button>`, or a link with `render` and `nativeButton={false}`,
 * and supplies `variant`, `color`, `size` and `rounded` to the base IconButton, which renders the `data-*`
 * attributes. Each option resolves in order: the prop, then the `ThemeProvider` override, then the config
 * default; `null` removes the attribute. The theme needs a `ThemeProvider`.
 *
 * It has no text, so it needs `aria-label` or `aria-labelledby`.
 *
 * @example
 * <IconButton aria-label="Add item" variant="outline" size="lg">
 *   <SvgIcon iconName="plus" />
 * </IconButton>
 * @cckPart root
 */
export const IconButton: IconButtonComponent = Object.assign(ThemedIconButton, { displayName: 'IconButton' });
