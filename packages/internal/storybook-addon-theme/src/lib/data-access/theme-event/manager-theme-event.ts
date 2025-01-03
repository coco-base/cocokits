import { addons } from '@storybook/manager-api';

import { ThemeEventBase } from './theme-event.base';

/**
 * Theming should be managed at the preview level to ensure consistency across the application.
 * At the manager level, our job is to send out theme change events.
 * Because, theme selection happens at the manager level, allowing a full-screen dialog for choosing themes,
 * instead of open the theme chooser dialog only inside of preview iframe.
 * Once a theme is chosen, the manager sends out the theme change event.
 * The preview level then handles this event, applying the necessary changes like updating local storage or changing document CSS selectors.
 *
 * Dispatch the initialize event must be emitted always at manager level, so the preview has the value at initialize the iframe
 *
 * Summery:
 * - manager:
 *    1- Dispatch event from theme chooser dialog
 *    2- Dispatch initialize event
 * - preview (CORE):
 *    1- Local Storage
 *    2- Iframe html css
 */
export class ThemeEvent extends ThemeEventBase {
  constructor() {
    super(addons.getChannel());

    // Dispatch the initialize event.
    this.dispatchTheme(this.localStorage.getThemeOrDefault());
  }
}
