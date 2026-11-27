'use client';

import type { ReactElement } from 'react';
import { Menu as BaseMenu, type MenuContentProps as BaseMenuContentProps } from '@cocokits/react/menu';
import { ThemeOptionsProvider } from '@cocokits/react-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type MenuOptions = CocokitsThemeConfig['components']['menu'];

/** The `size` values of the cocokits theme. */
export type MenuSize = MenuOptions['size']['values'][number];

/** Props of the themed {@link Menu.Content}: the base props plus the cocokits `size`. */
export interface MenuContentProps extends BaseMenuContentProps {
  /**
   * Height of the items.
   */
  readonly size?: MenuSize | null | undefined;
}

function ThemedMenuContent({ size, ...props }: MenuContentProps): ReactElement {
  return (
    <ThemeOptionsProvider componentName="menu" options={{ size }}>
      <BaseMenu.Content {...props} />
    </ThemeOptionsProvider>
  );
}

/**
 * The cocokits Menu content. It renders the base Menu content and supplies `size` to it, which renders `data-size`
 * on the content. The option resolves in order: the prop, then the `ThemeProvider` override, then the config
 * default; `null` removes the attribute. The theme needs a `ThemeProvider`.
 *
 * @example
 * <Menu.Content size="lg">
 *   <Menu.Item>Edit</Menu.Item>
 * </Menu.Content>
 * @cckPart content
 */
export const MenuContent: ((props: MenuContentProps) => ReactElement) & { displayName: string } = Object.assign(
  ThemedMenuContent,
  { displayName: 'Menu.Content' },
);
