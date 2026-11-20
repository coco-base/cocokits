'use client';

import type { ReactElement } from 'react';
import { TabNav as BaseTabNav, type TabNavRootProps as BaseTabNavRootProps } from '@cocokits/react/tab-nav';
import { ThemeOptionsProvider } from '@cocokits/react-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type TabNavOptions = CocokitsThemeConfig['components']['tab-nav'];

/** The `variant` values of the cocokits theme. */
export type TabNavVariant = TabNavOptions['variant']['values'][number];
/** The `color` values of the cocokits theme. */
export type TabNavColor = TabNavOptions['color']['values'][number];
/** The `size` values of the cocokits theme. */
export type TabNavSize = TabNavOptions['size']['values'][number];
/** The `headerAlign` values of the cocokits theme. */
export type TabNavHeaderAlign = TabNavOptions['headerAlign']['values'][number];

/** Props of the themed {@link TabNav.Root}: the base props plus the four cocokits options (the same as the Tabs). */
export interface TabNavRootProps extends BaseTabNavRootProps {
  /**
   * Look of the list and the indicator.
   */
  readonly variant?: TabNavVariant | null | undefined;
  /**
   * Color family of the indicator, rendered as `data-cck-color`.
   */
  readonly color?: TabNavColor | null | undefined;
  /**
   * Height, padding and text of the links.
   */
  readonly size?: TabNavSize | null | undefined;
  /**
   * Where the list sits across the links, or stretched over their whole width.
   */
  readonly headerAlign?: TabNavHeaderAlign | null | undefined;
}

function ThemedTabNavRoot({ variant, color, size, headerAlign, ...props }: TabNavRootProps): ReactElement {
  return (
    <ThemeOptionsProvider componentName="tab-nav" options={{ variant, color, size, headerAlign }}>
      <BaseTabNav.Root {...props} />
    </ThemeOptionsProvider>
  );
}

/** The themed {@link TabNav.Root} component and its `displayName`. */
export interface TabNavRootComponent {
  (props: TabNavRootProps): ReactElement;
  displayName: string;
}

/**
 * The cocokits TabNav root. It renders the base TabNav root and supplies `variant`, `color`, `size` and `headerAlign`
 * to it, which renders the `data-*` attributes on the root. Each option resolves in order: the prop, then the
 * `ThemeProvider` override, then the config default; `null` removes the attribute. The theme needs a
 * `ThemeProvider`.
 *
 * @example
 * <TabNav.Root aria-label="Project" variant="line" color="brand" size="lg" headerAlign="stretch">
 *   <TabNav.List>
 *     <TabNav.Link href="#overview" active>Overview</TabNav.Link>
 *     <TabNav.Indicator />
 *   </TabNav.List>
 * </TabNav.Root>
 * @cckPart root
 */
export const TabNavRoot: TabNavRootComponent = Object.assign(ThemedTabNavRoot, { displayName: 'TabNav.Root' });
