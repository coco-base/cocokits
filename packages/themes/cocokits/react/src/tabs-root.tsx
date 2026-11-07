'use client';

import type { ReactElement } from 'react';
import { Tabs as BaseTabs, type TabsRootProps as BaseTabsRootProps } from '@cocokits/react/tabs';
import { ThemeOptionsProvider } from '@cocokits/react-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type TabsOptions = CocokitsThemeConfig['components']['tabs'];

/** The `variant` values of the cocokits theme. */
export type TabsVariant = TabsOptions['variant']['values'][number];
/** The `color` values of the cocokits theme. */
export type TabsColor = TabsOptions['color']['values'][number];
/** The `size` values of the cocokits theme. */
export type TabsSize = TabsOptions['size']['values'][number];
/** The `headerAlign` values of the cocokits theme. */
export type TabsHeaderAlign = TabsOptions['headerAlign']['values'][number];

/** Props of the themed {@link Tabs.Root}: the base props plus the four cocokits options. */
export interface TabsRootProps extends BaseTabsRootProps {
  /**
   * Look of the list and the indicator.
   */
  readonly variant?: TabsVariant | null | undefined;
  /**
   * Color family of the indicator, rendered as `data-cck-color`.
   */
  readonly color?: TabsColor | null | undefined;
  /**
   * Height, padding and text of the triggers.
   */
  readonly size?: TabsSize | null | undefined;
  /**
   * Where the list sits across the tabs, or stretched over their whole width.
   */
  readonly headerAlign?: TabsHeaderAlign | null | undefined;
}

function ThemedTabsRoot({ variant, color, size, headerAlign, ...props }: TabsRootProps): ReactElement {
  return (
    <ThemeOptionsProvider componentName="tabs" options={{ variant, color, size, headerAlign }}>
      <BaseTabs.Root {...props} />
    </ThemeOptionsProvider>
  );
}

/** The themed {@link Tabs.Root} component and its `displayName`. */
export interface TabsRootComponent {
  (props: TabsRootProps): ReactElement;
  displayName: string;
}

/**
 * The cocokits Tabs root. It renders the base Tabs root and supplies `variant`, `color`, `size` and `headerAlign` to
 * it, which renders the `data-*` attributes on the root. Each option resolves in order: the prop, then the
 * `ThemeProvider` override, then the config default; `null` removes the attribute. The theme needs a
 * `ThemeProvider`.
 *
 * @example
 * <Tabs.Root defaultValue="account" variant="line" color="brand" size="lg" headerAlign="stretch">
 *   <Tabs.List aria-label="Account settings">
 *     <Tabs.Trigger value="account">Account</Tabs.Trigger>
 *     <Tabs.Indicator />
 *   </Tabs.List>
 *   <Tabs.Content value="account">Change your name.</Tabs.Content>
 * </Tabs.Root>
 * @cckPart root
 */
export const TabsRoot: TabsRootComponent = Object.assign(ThemedTabsRoot, { displayName: 'Tabs.Root' });
