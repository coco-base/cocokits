import { InjectionToken } from '@angular/core';

/** The defaults of every Tabs; provide them with {@link CCK_TABS_CONFIG}. */
export interface CckTabsConfig {
  /**
   * Whether a panel keeps its content once it was shown, hidden while its tab is not selected. An input on
   * the Tabs wins.
   * @defaultValue false
   */
  readonly preserveContent?: boolean | undefined;
}

/**
 * Provides the defaults of every Tabs below it. The provided object is the whole config: it does not merge
 * with a config of a parent injector.
 *
 * @example
 * providers: [{ provide: CCK_TABS_CONFIG, useValue: { preserveContent: true } }]
 */
export const CCK_TABS_CONFIG: InjectionToken<CckTabsConfig> = new InjectionToken<CckTabsConfig>('CCK_TABS_CONFIG');
