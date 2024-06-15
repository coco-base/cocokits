import { IconButton } from '@storybook/components';
import { addons, useChannel } from '@storybook/manager-api';
import React, { memo, useEffect, useState } from 'react';

import {
  CCK_OPEN_THEME_SELECTION_EVENT_NAME,
  CCK_THEME_CHANGED_EVENT_NAME,
  CckThemeChangedEvent,
} from '@coco-kits/storybook-theme-switcher';


export const TooCckThemeSwitcher = memo(() => {

  const [selectedTheme, setSelectedTheme] = useState<Pick<CckThemeChangedEvent, 'name' | 'iconPath'>>();

  const emit = useChannel({
    [CCK_THEME_CHANGED_EVENT_NAME]: (event: CckThemeChangedEvent) => setSelectedTheme(event),
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
            <img width="16px" src={selectedTheme.iconPath} alt={selectedTheme.name} />
            <div>{selectedTheme.name}</div>
          </>
          : <div>Select Theme</div>
      }

    </IconButton>
  );
});