/**
 * Configuration interface for the CocoKits Storybook Addon Theme.
 */
export interface StorybookAddonThemeConfig {
  /**
   * Configuration for Mixpanel analytics.
   */
  mixpanel?: {
    /**
     * Development token for Mixpanel.
     */
    devToken: string;
    /**
     * Production token for Mixpanel.
     */
    prodToken: string;
  };
  /**
   * Flag to hide the toolbar in Storybook.
   * Use this option for documentation projects only. Enabling this flag will hide the toolbar in all stories, including development stories used for testing components.
   */
  hideToolbar?: boolean;
}
