import { addons } from '@storybook/preview-api';
import { COLOR_MODE_CSS_SELECTORS } from '../../config/events.config';
import { ColorModeEventBase } from './color-mode-event.base';

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
  constructor() {
    super(addons.getChannel());

    this.colorModeChange$.subscribe((colorModeEvent) => {
      // 1-Iframe html css
      document.documentElement.classList.remove(...Object.values(COLOR_MODE_CSS_SELECTORS));
      document.documentElement.classList.add(COLOR_MODE_CSS_SELECTORS[colorModeEvent.colorMode]);
    });
  }
}
