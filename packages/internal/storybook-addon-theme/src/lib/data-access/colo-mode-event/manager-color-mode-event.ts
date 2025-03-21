import { addons } from '@storybook/manager-api';
import { withLatestFrom } from 'rxjs';

import { getInstance } from '@cocokits/common-utils';

import { ColorModeEventBase } from './color-mode-event.base';
import { COLOR_MODES } from '../../config/color-modes.config';
import { DocumentStyle } from '../../utils/document-styles';
import { ThemeEvent } from '../theme-event/manager-theme-event';

/**
 * Color Mode must be handled at both the manager and preview levels.
 * Some styles, such as the sidenav, are part of the manager, while the doc page is part of the preview.
 * This is why the core concept will be managed in the manager (e.g., updating Storybook config, local storage) to ensure
 * the color mode is always available, even if the preview is not loaded.
 * In the preview, we just update the document CSS selector so the doc page can apply the correct styles.
 *
 * Also we have to update the modes of the selected theme, base on the selected color mode.
 * For example, if the color mode has changed to dark, then we have to update the selected theme mode to use also dark color mode.
 * This step can be done at any place,
 * but to keep all core concepts in one place, we define it here.
 *
 * Dispatch the initialize event must be emitted always at manager level, so the preview has the value at initialize the iframe
 *
 * Summery:
 * - manager (CORE):
 *    1- Local Storage
 *    2- Storybook Config
 *    3- Root html css
 *    4- Update modes of selected theme
 *    5- Dispatch initialize event
 * - preview:
 *    1- Iframe html css
 */
export class ColorModeEvent extends ColorModeEventBase {
  private themeEvent = getInstance(ThemeEvent);
  private documentStyle = getInstance(DocumentStyle);

  constructor() {
    super(addons.getChannel());

    // Dispatch the initialize event.
    this.dispatchColorMode(this.localStorage.getColorModeOrDefault());

    this.colorModeChange$
      .pipe(withLatestFrom(this.themeEvent.themeChange$))
      .subscribe(([colorModeEvent, themeEvent]) => {
        // 1- Local Storage
        this.localStorage.setColorMode(colorModeEvent);

        // 2- Storybook Config
        addons.setConfig({ theme: COLOR_MODES[colorModeEvent.colorMode] });

        // 3- Root html css
        this.documentStyle.setColoMode(colorModeEvent.colorMode);

        // 4- Update modes of selected theme
        this.themeEvent.dispatchTheme({
          id: themeEvent.id,
          selectedModes: {
            ...themeEvent.selectedModes,
            ...themeEvent.colorModeTokenCollectionMode[colorModeEvent.colorMode],
          },
        });
      });
  }
}
