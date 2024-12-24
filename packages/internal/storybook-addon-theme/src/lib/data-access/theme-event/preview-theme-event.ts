import { addons } from '@storybook/preview-api';
import { ThemeEventBase } from './theme-event.base';
import { DocumentStyle } from '../../utils/document-styles';
import { getInstance } from '@cocokits/common-utils';
import { ColorMode, SelectedTheme } from '../../model/theme.model';
import { ColorModeEvent } from '../colo-mode-event/preview-color-mode-event';

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
  private documentStyle = getInstance(DocumentStyle);
  private colorModeEvent = getInstance(ColorModeEvent);

  constructor() {
    super(addons.getChannel());

    // The core concept of color mode change in the app
    this.themeChange$.subscribe((event) => {
      const selectedTheme: SelectedTheme = { id: event.id, selectedModes: event.selectedModes };

      // 1- Local Storage
      this.localStorage.setTheme(selectedTheme);

      // 2- IFrame html css
      this.documentStyle.setTheme(selectedTheme);

      // 3- Change The color mode of the documentation page if the selected theme has a mismatch with the current color mode
      const { colorMode } = this.colorModeEvent.getCurrentColorMode();
      const colorModeThemeCollectionModes = event.colorModeTokenCollectionMode[colorMode];
      const hasMismatchLightheartedMode = Object.entries(colorModeThemeCollectionModes).some(([collection, mode]) => {
        return selectedTheme.selectedModes[collection] ? selectedTheme.selectedModes[collection] !== mode : false;
      });

      if (hasMismatchLightheartedMode) {
        // eslint-disable-next-line no-alert
        const changeStorybookTheme = confirm(
          `The documentation page is currently in ${event.displayName} mode, but you've selected the ${colorMode === ColorMode.Light ? 'dark' : 'light'} mode for the theme. Some components might not display correctly. Would you like to change the documentation page theme to ${colorMode === ColorMode.Light ? 'dark' : 'light'} mode as well?`
        );

        if (changeStorybookTheme) {
          this.colorModeEvent.dispatchColorMode(colorMode === ColorMode.Light ? ColorMode.Dark : ColorMode.Light);
        }
      }
    });
  }
}
