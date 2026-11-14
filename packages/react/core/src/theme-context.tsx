'use client';

import { createContext, type Context, type ReactElement, type ReactNode } from 'react';
import type { ThemeConfig, ThemeOptionValues } from '@cocokits/shared';

/** The theme provided for an app or a subtree. */
export interface ThemeState {
  /** The theme's options and defaults. */
  readonly themeConfig: ThemeConfig;
  /** Option values by component name that win over the config defaults. */
  readonly overrides: Readonly<Record<string, ThemeOptionValues | undefined>>;
}

/** The option values a theme wrapper provides for the component below it. */
export interface ThemeOptionsState {
  /** Component name in the `ThemeConfig` (the anatomy block). */
  readonly componentName: string;
  /** Option values by option name. `undefined` defers to the next level; `null` removes the attribute. */
  readonly options: ThemeOptionValues;
}

/** The current theme. `null` means unthemed. @internal */
export const ThemeContext: Context<ThemeState | null> = createContext<ThemeState | null>(null);

/** The option values of the nearest theme wrapper. @internal */
export const ThemeOptionsContext: Context<ThemeOptionsState | null> = createContext<ThemeOptionsState | null>(null);

/** Props of {@link ThemeProvider}. */
export interface ThemeProviderProps {
  /** The executable theme config (for example `cocokitsThemeConfig`). */
  readonly themeConfig: ThemeConfig;
  /** Option values per component that win over the config defaults. `null` removes an attribute. */
  readonly overrides?: ThemeState['overrides'] | undefined;
  /** The subtree that is themed. */
  readonly children?: ReactNode;
}

/**
 * Provides a theme for the app or a subtree. A nested provider replaces the outer one.
 * Without a provider every part renders no theme `data-*`.
 */
export function ThemeProvider({ themeConfig, overrides, children }: ThemeProviderProps): ReactElement {
  return <ThemeContext value={{ themeConfig, overrides: overrides ?? {} }}>{children}</ThemeContext>;
}

/** Props of {@link ThemeOptionsProvider}. */
export interface ThemeOptionsProviderProps extends ThemeOptionsState {
  /** The base part (or parts) that read the options. */
  readonly children?: ReactNode;
}

/**
 * Lets a theme wrapper give its own option values to the base parts below it. A value of
 * `undefined` falls back to the provider override and then to the config default; `null`
 * removes the attribute.
 */
export function ThemeOptionsProvider({ componentName, options, children }: ThemeOptionsProviderProps): ReactElement {
  return <ThemeOptionsContext value={{ componentName, options }}>{children}</ThemeOptionsContext>;
}
