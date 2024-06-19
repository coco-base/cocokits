import { addons, types } from '@storybook/manager-api';

import { openOverlay, OverlayAnimationType } from '@coco-kits/react-overlay';

import {
  CCK_OPEN_THEME_SELECTION_EVENT_NAME,
  CCK_THEME_CHANGED_EVENT_NAME,
  CCK_THEME_SWITCHER_TOOL_ID,
  CckSelectedTheme,
  CckThemeChangedEvent,
  CckThemeLocalstorage,
  DEFAULT_SELECTED_CCK_THEME_MODES,
  DEFAULT_SELECTED_CCK_THEME_NAME,
  LOCALSTORAGE_CCK_THEME,
} from '../index';
import {
  CckThemeDialog,
  SelectThemeDialogData,
  SelectThemeDialogResult,
} from '../lib/componenets/cck-theme-dialog/CckThemeDialog';
import { ToolCckThemeSwitcher } from '../lib/componenets/cck-theme-switcher/ToolCckThemeSwitcher';
import { generateCckThemeChangeEventData } from '../lib/componenets/theme-switcher.utils';

export function registerCckThemeSwitcher() {
  listenToOpenDialogEvent();
  dispatchDefaultThemEvent();
  addToolbarIcon();
}

function listenToOpenDialogEvent() {
  const channel = addons.getChannel();

  channel.on(CCK_OPEN_THEME_SELECTION_EVENT_NAME, async () => {
    const lastEvent: CckThemeChangedEvent[] | undefined = channel.last(CCK_THEME_CHANGED_EVENT_NAME);
    const result = await openOverlay<SelectThemeDialogData, SelectThemeDialogResult>(CckThemeDialog, {
      data: {
        selectedThemeName: lastEvent?.[0].name ?? 'Default',
      },
      animationType: OverlayAnimationType.CenterTopToBottom,
    });

    if (!result) {
      return;
    }

    changeTheme({
      name: result.themeName,
      selectedModes: result.selectedModes,
    });
  });
}

function changeTheme({ name, selectedModes }: CckSelectedTheme) {
  const channel = addons.getChannel();
  window.localStorage.setItem(
    LOCALSTORAGE_CCK_THEME,
    JSON.stringify({ name, selectedModes } satisfies CckThemeLocalstorage)
  );

  channel.emit(CCK_THEME_CHANGED_EVENT_NAME, generateCckThemeChangeEventData({ name, selectedModes }));
}

function dispatchDefaultThemEvent() {
  const localstorageTheme = window.localStorage.getItem(LOCALSTORAGE_CCK_THEME);

  if (localstorageTheme) {
    const selectedTheme = JSON.parse(localstorageTheme) as CckThemeLocalstorage;
    changeTheme({
      name: selectedTheme.name,
      selectedModes: selectedTheme.selectedModes,
    });
    return;
  }

  changeTheme({
    name: DEFAULT_SELECTED_CCK_THEME_NAME,
    selectedModes: DEFAULT_SELECTED_CCK_THEME_MODES,
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
