import { addons } from '@storybook/preview-api';
import React, { useEffect, useState } from 'react';

import { STORYBOOK_THEME_CHANGED_EVENT_NAME } from '@cocokits/storybook-theme-switcher';

import { useStyles } from './DocStorybookThemeSwitcher.style';
import { StorybookDarkThemeIcon } from './StorybookDarkThemeIcon';
import { StorybookLightThemeIcon } from './StorybookLightThemeIcon';
import { useSelectedStorybookTheme } from '../../hooks/useSelectedStorybookTheme.utils';


export const DocCckStorybookThemeSwitcher = () => {

  const styles = useStyles();
  const selectedThemeName = useSelectedStorybookTheme({useEffect, useState});

  const onChangeThemeClick = (themeName: 'light' | 'dark') => {
    addons.getChannel().emit(STORYBOOK_THEME_CHANGED_EVENT_NAME, { themeName });
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