import { provide, type InjectionKey } from 'vue';
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

/** Props of the `ThemeProvider` component. */
export interface ThemeProviderProps {
  /** The executable theme config (for example `cocokitsThemeConfig`). */
  readonly themeConfig: ThemeConfig;
  /** Option values per component that win over the config defaults. `null` removes an attribute. */
  readonly overrides?: ThemeState['overrides'] | undefined;
}

/** Getter of the current theme, so a changed prop reaches the parts. @internal */
export const THEME_KEY: InjectionKey<() => ThemeState> = Symbol('cck-theme');

/** Getter of the option values of the nearest theme wrapper. @internal */
export const THEME_OPTIONS_KEY: InjectionKey<() => ThemeOptionsState> = Symbol('cck-theme-options');

/**
 * Lets a theme wrapper give its own option values to the base parts below it. Call it in
 * `setup`. A value of `undefined` falls back to the provider override and then to the config
 * default; `null` removes the attribute.
 *
 * @param componentName - Component name in the `ThemeConfig` (the anatomy block).
 * @param getOptions - Reads the current option values; called when the attributes are computed.
 */
export function provideThemeOptions(componentName: string, getOptions: () => ThemeOptionValues): void {
  provide(THEME_OPTIONS_KEY, () => ({ componentName, options: getOptions() }));
}
