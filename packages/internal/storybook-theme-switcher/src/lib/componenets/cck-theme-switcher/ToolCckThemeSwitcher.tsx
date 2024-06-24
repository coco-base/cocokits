import { IconButton } from '@storybook/components';
import { addons, useChannel } from '@storybook/manager-api';
import React, { memo, useEffect, useState } from 'react';

import {
  CCK_OPEN_THEME_SELECTION_EVENT_NAME,
  CCK_THEME_CHANGED_EVENT_NAME,
  CckThemeChangedEvent, STORYBOOK_THEME_CHANGED_EVENT_NAME, StorybookThemeChangedEvent, StorybookThemeName,
} from '@cocokits/storybook-theme-switcher';


export const ToolCckThemeSwitcher = memo(() => {

  const [selectedTheme, setSelectedTheme] = useState<Pick<CckThemeChangedEvent, 'name' | 'iconPathLight' | 'iconPathDark'>>();
  const [selectedStorybookTheme, setSelectedStorybookTheme] = useState<StorybookThemeName>();

  const emit = useChannel({
    [CCK_THEME_CHANGED_EVENT_NAME]: (event: CckThemeChangedEvent) => setSelectedTheme(event),
    [STORYBOOK_THEME_CHANGED_EVENT_NAME]: (event: StorybookThemeChangedEvent) => setSelectedStorybookTheme(event.themeName)
  });


  useEffect(() => {
    const lastEvent: CckThemeChangedEvent[] | undefined =  addons.getChannel().last(CCK_THEME_CHANGED_EVENT_NAME);
    if(lastEvent) {
      setSelectedTheme(lastEvent[0]);
      return;
    }
  }, []);


  return (
    <IconButton
      active={true}
      title="Theme"
      onClick={() => {
        emit(CCK_OPEN_THEME_SELECTION_EVENT_NAME);
      }}>
      {
        selectedTheme
          ? <>
            <img
              width="16px"
              src={selectedStorybookTheme === 'dark' ? selectedTheme.iconPathDark : selectedTheme.iconPathLight}
              alt={selectedTheme.name} />
            <div>{selectedTheme.name}</div>
          </>
          : <div>Select Theme</div>
      }

    </IconButton>
  );
});