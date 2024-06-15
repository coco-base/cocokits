import React, { useEffect, useState } from 'react';
import {
  LOCALSTORAGE_STORYBOOK_THEME,
  STORYBOOK_THEME_CHANGED_EVENT_NAME,
  StorybookThemeChangedEvent,
  StorybookThemeName,
} from '@coco-kits/storybook-theme-switcher';
import { addons } from '@storybook/preview-api';
import { StorybookDarkThemeIcon } from './StorybookDarkThemeIcon';
import { StorybookLightThemeIcon } from './StorybookLightThemeIcon';
import { useStyles } from './DocStorybookThemeSwitcher.style';


export const DocCocoKitsThemeSwitcher = () => {

  const channel = addons.getChannel();

  const [selectedThemeName, setSelectedThemeName] = useState<StorybookThemeName>();
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
    const lastEvents: StorybookThemeChangedEvent[] | undefined = channel.last(STORYBOOK_THEME_CHANGED_EVENT_NAME);
    const themeName = lastEvents && lastEvents.length > 0
      ? lastEvents[0].themeName
      : window.localStorage.getItem(LOCALSTORAGE_STORYBOOK_THEME) as StorybookThemeName;

    setSelectedThemeName(themeName);

  }, []);

  useEffect(() => {

    const onStorybookThemeChanged = ({ themeName }: StorybookThemeChangedEvent) => {
      setSelectedThemeName(themeName);
    };

    channel.on(STORYBOOK_THEME_CHANGED_EVENT_NAME, onStorybookThemeChanged);

    return () => {
      channel.off(STORYBOOK_THEME_CHANGED_EVENT_NAME, onStorybookThemeChanged);
    };

  }, [channel]);

  const onChangeThemeClick = (themeName: 'light' | 'dark') => {
    channel.emit(STORYBOOK_THEME_CHANGED_EVENT_NAME, { themeName });
  };

  const LightBtn = (
    <button className={styles.iconButton} onClick={() => onChangeThemeClick('dark')}>
      <StorybookLightThemeIcon></StorybookLightThemeIcon>
    </button>
  );

  const DarkBtn = (
    <button className={styles.iconButton} onClick={() => onChangeThemeClick('light')}>
      <StorybookDarkThemeIcon></StorybookDarkThemeIcon>
    </button>
  );

  return selectedThemeName === 'light' ? LightBtn : DarkBtn;
};