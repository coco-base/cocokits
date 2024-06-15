import { addons } from '@storybook/preview-api';
import React, { useEffect, useState } from 'react';

import { useStyles } from './DocCckThemeSwitcher.style';
import {
  CCK_OPEN_THEME_SELECTION_EVENT_NAME,
  CCK_THEME_CHANGED_EVENT_NAME, CCK_THEMES,
  LOCALSTORAGE_CCK_THEME,
} from '../../config/cck-theme.config';
import { CckThemeChangedEvent, CckThemeLocalstorage } from '../../config/cck-themes.model';


export const DocCckThemeSwitcher = () => {

  const channel = addons.getChannel();

  const [selectedTheme, setSelectedTheme] = useState<Pick<CckThemeChangedEvent, 'name' | 'iconPath'>>();
  const styles = useStyles();

  useEffect(() => {
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
    const lastEvents: CckThemeChangedEvent[] | undefined = channel.last(CCK_THEME_CHANGED_EVENT_NAME);
    if(lastEvents && lastEvents.length > 0) {
      setSelectedTheme(lastEvents[0]);
      return;
    }

    const localstorageThemeString = window.localStorage.getItem(LOCALSTORAGE_CCK_THEME);

    if(localstorageThemeString) {
      const localstorageTheme = JSON.parse(localstorageThemeString) as CckThemeLocalstorage;
      setSelectedTheme({
        name: localstorageTheme.name,
        iconPath: CCK_THEMES[localstorageTheme.name].iconPath
      });
    }


  }, []);

  useEffect(() => {

    const onStorybookThemeChanged = (event: CckThemeChangedEvent) => {
      setSelectedTheme(event);
    };

    channel.on(CCK_THEME_CHANGED_EVENT_NAME, onStorybookThemeChanged);

    return () => {
      channel.off(CCK_THEME_CHANGED_EVENT_NAME, onStorybookThemeChanged);
    };

  }, [channel]);


  return (
    <button className={styles.selectThemeBtn} onClick={() => {
      channel.emit(CCK_OPEN_THEME_SELECTION_EVENT_NAME);
    }}>
      {
        selectedTheme
          ? <>
            <img width="24px" src={selectedTheme.iconPath} alt={selectedTheme.name} />
            <div>{selectedTheme.name}</div>
          </>
          : <div>Select Theme</div>
      }
      <svg width="12" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M7 5.53585L12.2788 0.29285C12.6725 -0.0976155 13.3109 -0.0976164 13.7047 0.292849C14.0984 0.683314 14.0984 1.31638 13.7047 1.70685L7.71307 7.65674C7.31925 8.04727 6.68075 8.04727 6.28693 7.65674L0.295317 1.70685C-0.0984392 1.31638 -0.0984391 0.683314 0.295318 0.292849C0.689074 -0.0976165 1.32748 -0.0976162 1.72124 0.292849L7 5.53585Z"
          fill="#52525B" />
      </svg>

    </button>
  );
};