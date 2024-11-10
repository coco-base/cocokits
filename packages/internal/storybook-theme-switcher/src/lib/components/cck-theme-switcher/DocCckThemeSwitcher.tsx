import { mergeClasses } from '@griffel/react';
import { addons } from '@storybook/preview-api';
import  { useEffect, useState } from 'react';

import { useStyles } from './DocCckThemeSwitcher.style';
import { CCK_OPEN_THEME_SELECTION_EVENT_NAME, CCK_THEME_CHANGED_EVENT_NAME } from '../../config/cck-theme.config';
import { CckThemeChangedEvent } from '../../config/cck-themes.model';
import { useDocSelectedStorybookTheme } from '../../hooks/useDocSelectedStorybookTheme';
import { generateCckThemeChangeEventData, getSelectedCckTheme } from '../theme-switcher.utils';


export const DocCckThemeSwitcher = () => {

  const channel = addons.getChannel();
  const [selectedTheme, setSelectedTheme] = useState<CckThemeChangedEvent>();
  const selectedStorybookTheme = useDocSelectedStorybookTheme();
  const styles = useStyles();

  // Listen to CckTheme Changes
  useEffect(() => {
    // Last Event
    const lastSelectedCckTheme = getSelectedCckTheme();
    if(lastSelectedCckTheme) {
      setSelectedTheme(generateCckThemeChangeEventData(lastSelectedCckTheme));
    }

    // Listen to events
    const onStorybookThemeChanged = (event: CckThemeChangedEvent) => {
      setSelectedTheme(event);
    };

    channel.on(CCK_THEME_CHANGED_EVENT_NAME, onStorybookThemeChanged);

    return () => {
      channel.off(CCK_THEME_CHANGED_EVENT_NAME, onStorybookThemeChanged);
    };
  }, []);

  return (
    // sb-unstyled: Remove default storybook styles
    <button className={mergeClasses(styles.selectThemeBtn, 'sb-unstyled')} onClick={() => {
      channel.emit(CCK_OPEN_THEME_SELECTION_EVENT_NAME);
    }}>
      {
        selectedTheme
          ? <>
            <img
              width="24px"
              src={selectedStorybookTheme === 'dark' ? selectedTheme.iconPathDark : selectedTheme.iconPathLight}
              alt={selectedTheme.name} />
            <div>{selectedTheme.name}</div>
          </>
          : <div>Select Theme</div>
      }
      <svg className={styles.arrowDownIcon} width="12" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M7 5.53585L12.2788 0.29285C12.6725 -0.0976155 13.3109 -0.0976164 13.7047 0.292849C14.0984 0.683314 14.0984 1.31638 13.7047 1.70685L7.71307 7.65674C7.31925 8.04727 6.68075 8.04727 6.28693 7.65674L0.295317 1.70685C-0.0984392 1.31638 -0.0984391 0.683314 0.295318 0.292849C0.689074 -0.0976165 1.32748 -0.0976162 1.72124 0.292849L7 5.53585Z" />
      </svg>

    </button>
  );
};