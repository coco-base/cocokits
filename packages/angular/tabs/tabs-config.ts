import { InjectionToken } from '@angular/core';

/** The defaults of every Tabs. Provide them with {@link CCK_TABS_CONFIG}. */
export interface CckTabsConfig {
  /**
   * Whether a panel keeps its content after it was shown once. The `preserveContent` input of a Tabs wins over it.
   * @defaultValue false
   */
  readonly preserveContent?: boolean | undefined;
}

/**
 * Gives the defaults to every Tabs below it. The object you give is the whole config. It does not merge with the config of a parent.
 *
 * @example
 * providers: [{ provide: CCK_TABS_CONFIG, useValue: { preserveContent: true } }]
 */
export const CCK_TABS_CONFIG: InjectionToken<CckTabsConfig> = new InjectionToken<CckTabsConfig>('CCK_TABS_CONFIG');
