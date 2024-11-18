import { addons } from '@storybook/preview-api';
import { THEME_HTML_ATTRIBUTE_MODE_NAME, THEME_HTML_ATTRIBUTE_THEME_NAME } from '../../config/events.config';
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
 *    3- Listen to the color mode changes
 */
export class ThemeEvent extends ThemeEventBase {
  constructor() {
    super(addons.getChannel());

    // The core concept of color mode change in the app
    this.themeChange$.subscribe((event) => {
      // 1- Local Storage
      this.localStorage.setTheme({ id: event.id, selectedModes: event.selectedModes });

      // 2- IFrame html css
      const attr = Object.entries(event.selectedModes)
        .map(([collectionName, mode]) => `${event.id}__${collectionName}--${mode}`)
        .join(' ');
      document.documentElement.setAttribute(THEME_HTML_ATTRIBUTE_MODE_NAME, attr);
      document.documentElement.setAttribute(THEME_HTML_ATTRIBUTE_THEME_NAME, event.id);

      // Remount the story to the story decorators. (in Angular we need to update `ThemeConfig` token to get the latest theme)
      // addons.getChannel().emit(events.FORCE_REMOUNT, {storyId: storyContext.id});
    });
  }
}
