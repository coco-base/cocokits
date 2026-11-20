import { InjectionToken, inject, type Provider, type ProviderToken, type Signal } from '@angular/core';
import type { ThemeConfig, ThemeOptionValues } from '@cocokits/shared';

/**
 * Option values by component name, applied over the theme's defaults for a subtree. Typed from
 * the config: only its components and options, and only the values each option lists.
 * `null` removes the attribute; `undefined` defers to the config default.
 */
export type CckThemeOverrides<C extends ThemeConfig = ThemeConfig> = {
  readonly [K in keyof C['components']]?: {
    readonly [O in keyof C['components'][K]]?: C['components'][K][O] extends {
      readonly values: readonly (infer V)[];
    }
      ? V | null | undefined
      : never;
  };
};

/** The theme provided for an app or a subtree. */
export interface CckThemeState {
  /** The theme's options and defaults. */
  readonly themeConfig: ThemeConfig;
  /** Option values that win over the config defaults. */
  readonly overrides: Readonly<Record<string, ThemeOptionValues | undefined>>;
}

/** The option values a theme directive provides for the component on its element. */
export interface CckThemeOptions {
  /** Component name in the `ThemeConfig` (the anatomy block). */
  readonly componentName: string;
  /**
   * The directive's input signals by option name, as they are. A signal that holds `undefined`
   * defers to the next level; `null` removes the attribute.
   */
  readonly values: Readonly<Record<string, Signal<string | boolean | null | undefined>>>;
}

/** The current theme. Not provided means unthemed; consumers inject it with `optional: true`. */
export const CCK_THEME: InjectionToken<CckThemeState> = new InjectionToken<CckThemeState>('CCK_THEME');

/** The option values of the theme directive on the root element. @internal */
export const CCK_THEME_OPTIONS: InjectionToken<CckThemeOptions> = new InjectionToken<CckThemeOptions>(
  'CCK_THEME_OPTIONS',
);

/**
 * Provides a theme for the app or a subtree. A nested provider replaces the outer one.
 *
 * @param themeConfig - The executable theme config (for example `cocokitsThemeConfig`).
 * @param overrides - Option values per component that win over the config defaults.
 */
export function provideCckTheme<const C extends ThemeConfig>(
  themeConfig: C,
  overrides: CckThemeOverrides<C> = {},
): Provider {
  const state: CckThemeState = { themeConfig, overrides: overrides as CckThemeState['overrides'] };
  return { provide: CCK_THEME, useValue: state };
}

/**
 * Lets a theme directive provide its option values to the base parts. Put it in the
 * directive's `providers`. The input signals are passed on unchanged: the base parts read
 * them when they resolve the attributes, so a change of an input updates the attributes.
 * A value of `undefined` falls back to the next level; `null` removes the attribute.
 *
 * @param componentName - Component name in the `ThemeConfig` (the anatomy block).
 * @param themeDirective - The theme directive class; wrap it in `forwardRef` inside its own decorator.
 * @param resolveOptions - Picks the directive's input signals by option name, for example
 *   `(theme) => ({ size: theme.size })`. Do not call the signals.
 */
export function provideThemeOptions<T>(
  componentName: string,
  themeDirective: ProviderToken<T>,
  resolveOptions: (instance: T) => CckThemeOptions['values'],
): Provider {
  return {
    provide: CCK_THEME_OPTIONS,
    useFactory: (): CckThemeOptions => ({ componentName, values: resolveOptions(inject(themeDirective)) }),
  };
}
