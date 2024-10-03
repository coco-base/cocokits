import events from '@storybook/core-events';
import { addons, types } from '@storybook/manager-api';

import { openOverlay, OverlayAnimationType } from '@cocokits/react-overlay';

import {
  CCK_OPEN_THEME_SELECTION_EVENT_NAME,
  CCK_THEME_CHANGED_EVENT_NAME,
  CCK_THEME_SWITCHER_TOOL_ID,
  CCK_THEMES_MAP,
  CckSelectedTheme,
  CckThemeChangedEvent,
  CckThemeLocalstorage,
  DEFAULT_SELECTED_CCK_THEME_ID,
  DEFAULT_SELECTED_CCK_THEME_MODES,
  LOCALSTORAGE_CCK_THEME,
  STORYBOOK_THEME_CHANGED_EVENT_NAME,
  StorybookThemeChangedEvent,
} from '../index';
import {
  CckThemeDialog,
  SelectThemeDialogData,
  SelectThemeDialogResult,
} from '../lib/components/cck-theme-dialog/CckThemeDialog';
import { ToolCckThemeSwitcher } from '../lib/components/cck-theme-switcher/ToolCckThemeSwitcher';
import { generateCckThemeChangeEventData } from '../lib/components/theme-switcher.utils';

export function registerCckThemeSwitcher() {
  listenToStorybookThemeChangeEvent();
  listenToOpenDialogEvent();
  dispatchDefaultThemEvent();
  addToolbarIcon();
}

function listenToStorybookThemeChangeEvent() {
  const channel = addons.getChannel();
  channel.on(STORYBOOK_THEME_CHANGED_EVENT_NAME, ({ themeName }: StorybookThemeChangedEvent) => {
    const lastCckThemeChangeEvent: CckThemeChangedEvent[] | undefined = channel.last(CCK_THEME_CHANGED_EVENT_NAME);

    if (!lastCckThemeChangeEvent || lastCckThemeChangeEvent.length === 0) {
      return;
    }

    const partialCckSelectedModes =
      themeName === 'light'
        ? CCK_THEMES_MAP[lastCckThemeChangeEvent[0].id].lightCollectionModes
        : CCK_THEMES_MAP[lastCckThemeChangeEvent[0].id].darkCollectionModes;

    const selectedModes = {
      ...lastCckThemeChangeEvent[0].selectedModes,
      ...partialCckSelectedModes,
    };

    changeTheme({ id: lastCckThemeChangeEvent[0].id, selectedModes });
  });
}

function listenToOpenDialogEvent() {
  const channel = addons.getChannel();

  channel.on(CCK_OPEN_THEME_SELECTION_EVENT_NAME, async () => {
    const lastEvent: CckThemeChangedEvent[] | undefined = channel.last(CCK_THEME_CHANGED_EVENT_NAME);
    const lastStorybookThemeName: StorybookThemeChangedEvent[] | undefined = channel.last(
      STORYBOOK_THEME_CHANGED_EVENT_NAME
    );
    const storybookThemeName = lastStorybookThemeName?.[0].themeName ?? 'dark';
    const result = await openOverlay<SelectThemeDialogData, SelectThemeDialogResult>(CckThemeDialog, {
      data: {
        selectedThemeId: lastEvent?.[0].id ?? 'default',
        selectedThemeModes: lastEvent?.[0].selectedModes ?? {},
        storybookThemeName: storybookThemeName,
      },
      animationType: OverlayAnimationType.CenterTopToBottom,
    });

    if (!result) {
      return;
    }

    changeTheme({
      id: result.themeId,
      selectedModes: result.selectedModes,
    });

    if (result.changeStorybookTheme) {
      const storybookThemeChangeEventData: StorybookThemeChangedEvent = {
        themeName: storybookThemeName === 'light' ? 'dark' : 'light',
      };
      channel.emit(STORYBOOK_THEME_CHANGED_EVENT_NAME, storybookThemeChangeEventData);
    }
  });
}

function changeTheme({ id, selectedModes }: CckSelectedTheme) {
  const channel = addons.getChannel();
  window.localStorage.setItem(
    LOCALSTORAGE_CCK_THEME,
    JSON.stringify({ id, selectedModes } satisfies CckThemeLocalstorage)
  );

  channel.emit(CCK_THEME_CHANGED_EVENT_NAME, generateCckThemeChangeEventData({ id, selectedModes }));
}

function dispatchDefaultThemEvent() {
  // Make sure the first story has rendered, before dispatch the default value.
  // Otherwise, the stories will miss the first event and the value will be undefined.
  addons.getChannel().once(events.CURRENT_STORY_WAS_SET, () => {
    const localstorageTheme = window.localStorage.getItem(LOCALSTORAGE_CCK_THEME);

    if (localstorageTheme) {
      const selectedTheme = JSON.parse(localstorageTheme) as CckThemeLocalstorage;
      changeTheme({
        id: selectedTheme.id,
        selectedModes: selectedTheme.selectedModes,
      });
      return;
    }

    changeTheme({
      id: DEFAULT_SELECTED_CCK_THEME_ID,
      selectedModes: DEFAULT_SELECTED_CCK_THEME_MODES,
    });
  });
}

// Register the cck theme switcher tool
function addToolbarIcon() {
  addons.add(CCK_THEME_SWITCHER_TOOL_ID, {
    type: types.TOOL,
    title: 'CCK Theme Switcher',
    match: ({ tabId, viewMode }) => !tabId && viewMode === 'story',
    render: ToolCckThemeSwitcher,
  });
}
