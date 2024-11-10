import { addons } from '@storybook/preview-api';

import { CCK_THEME_CHANGED_EVENT_NAME, CCK_THEMES_MAP } from '../config/cck-theme.config';
import { CckSelectedTheme, CckThemeChangedEvent } from '../config/cck-themes.model';
import { STORYBOOK_THEME_CHANGED_EVENT_NAME } from '../config/storybook-theme.config';
import { StorybookThemeChangedEvent, StorybookThemeName } from '../config/storybook-theme.model';
import { LocalStorage } from '../utils/local-storage';

export function generateCckThemeChangeEventData({ id, selectedModes }: CckSelectedTheme): CckThemeChangedEvent {
  return {
    id,
    name: CCK_THEMES_MAP[id].name,
    iconPathLight: CCK_THEMES_MAP[id].iconPathLight,
    iconPathDark: CCK_THEMES_MAP[id].iconPathDark,
    tokenDictionary: CCK_THEMES_MAP[id].tokenDictionary,
    selectedModes,
    themeConfig: CCK_THEMES_MAP[id].themeConfig,
    svgIconMap: CCK_THEMES_MAP[id].svgIconMap,
  };
}

export function getSelectedCckTheme(): CckThemeChangedEvent | null {
  /**
   * TODO: Check it one more them. I changed `dispatchDefaultThemEvent` function to dispatch the first event after the storybook is ready.
   * Initialized themeName:
   *
   * The source event is initialized in the manager file and the initialized value is dispatched from the manager.
   * However, the DocPage renders inside an iframe. At initialization, the iframe tries to listen to the post message
   * from the manager, but it's too late; the manager has already dispatched the initial value, and the DocPage renders
   * after the event is dispatched. Thus, the last value of all events is undefined only during the initial app bootstrap.
   *
   * After the app bootstrap, navigating to and from the DocPage allows it to receive the latest event because Storybook
   * is already listening to the manager's events.
   *
   * To fix this issue, we check if the last event exists; if not, the value
   * is retrieved from local storage. Our theme switcher Storybook addon also saves the selected theme in local storage.
   *
   */
  const lastEvents: CckThemeChangedEvent[] | undefined = addons.getChannel().last(CCK_THEME_CHANGED_EVENT_NAME);
  if (lastEvents && lastEvents.length > 0) {
    return lastEvents[0];
  }

  const cckTheme = LocalStorage.getCckThemeOrDefault();
  return generateCckThemeChangeEventData(cckTheme);
}

export function getSelectedStorybookTheme(): StorybookThemeName {
  /**
   * Initialized themeName:
   *
   * The source event is initialized in the manager file and the initialized value is dispatched from the manager.
   * However, the DocPage renders inside an iframe. At initialization, the iframe tries to listen to the post message
   * from the manager, but it's too late; the manager has already dispatched the initial value, and the DocPage renders
   * after the event is dispatched. Thus, the last value of all events is undefined only during the initial app bootstrap.
   *
   * After the app bootstrap, navigating to and from the DocPage allows it to receive the latest event because Storybook
   * is already listening to the manager's events.
   *
   * To fix this issue, we check if the last event exists; if not, the value
   * is retrieved from local storage. Our theme switcher Storybook addon also saves the selected theme in local storage.
   *
   */
  const lastEvents: StorybookThemeChangedEvent[] | undefined = addons
    .getChannel()
    .last(STORYBOOK_THEME_CHANGED_EVENT_NAME);

  if (lastEvents && lastEvents.length > 0) {
    return lastEvents[0].themeName;
  }

  return LocalStorage.getStorybookThemeOrDefault();
}
