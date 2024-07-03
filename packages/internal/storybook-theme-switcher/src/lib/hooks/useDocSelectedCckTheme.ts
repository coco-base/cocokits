import { addons } from '@storybook/preview-api';
import { useState } from 'react';

import {
  CCK_THEME_CHANGED_EVENT_NAME,
  CckThemeChangedEvent,
  getSelectedCckTheme,
} from '@cocokits/storybook-theme-switcher';

export function useDocSelectedCckTheme() {
  const [selectedTheme, setSelectedTheme] = useState<CckThemeChangedEvent | null>(getSelectedCckTheme());

  const channel = addons.getChannel();
  channel.on(CCK_THEME_CHANGED_EVENT_NAME, (theme: CckThemeChangedEvent) => {
    setSelectedTheme(theme);
  });

  return selectedTheme;
}
