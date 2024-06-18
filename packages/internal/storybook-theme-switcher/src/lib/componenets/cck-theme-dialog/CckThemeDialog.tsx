import { mergeClasses } from '@griffel/react';
import React, { useMemo, useState } from 'react';

import { OverlayRef } from '@coco-kits/react-overlay';
import { CCK_THEMES, CckThemeName, useDocSelectedStorybookTheme } from '@coco-kits/storybook-theme-switcher';

import { useStyles } from './CckThemeDialog.style';


export interface SelectThemeDialogData {
  selectedThemeName: CckThemeName,
  themeNames: CckThemeName[];
}

export interface SelectThemeDialogResult {
  themeName: CckThemeName,
  selectedModes: Record<string, string>; // {"sizing": "compact", "local-style": "default"}
}


const DUMMY_RESULT: SelectThemeDialogResult = {
  themeName: 'FrameX',
  selectedModes: {
    'sizing': 'compact',
    'local-style': 'default'
  },
};

export const CckThemeDialog = ({ data, close }: OverlayRef<SelectThemeDialogData, SelectThemeDialogResult>) => {
  const styles = useStyles();
  const [selectedCckThemeName, setSelectedCckThemeName] = useState<CckThemeName>(data.selectedThemeName);
  const selectedStorybookTheme = useDocSelectedStorybookTheme();

  const selectedCollections = useMemo(() => {
    const theme = CCK_THEMES[selectedCckThemeName];
    return theme ? Object.entries(theme.collections) : null;
  }, [selectedCckThemeName, data.themeNames]);

  return (
    <div className={styles.wrapper}>

      <div className={styles.toolbar}>
        <div>Design System Theme</div>
        <button className={styles.toolbarCloseBtn} onClick={() => close()}></button>
      </div>

      <div className={styles.themeWrapper}>
        {data.themeNames.map(themeName =>
          <div
            key={themeName}
            className={mergeClasses(
              styles.themeItem,
              selectedCckThemeName === themeName && styles.themeItemSelected)}
            onClick={() => {
              setSelectedCckThemeName(themeName);
            }}
          >
            <img
              className={styles.themeIcon}
              src={selectedStorybookTheme === 'dark' ? CCK_THEMES[themeName].iconPathDark : CCK_THEMES[themeName].iconPathLight}
              alt={themeName} />
            <div className={styles.themeName}>{themeName}</div>
          </div>,
        )}
      </div>

      <hr />

      <div className={styles.collectionsSelection}>
        {selectedCollections?.map(([name, modes]) => {
          return (
            <div key={name} className={styles.collectionWrapper}>
              <div className={styles.collectionName}>{name}</div>
              <div className={styles.collectionModeWrapper}>
                {modes.map(mode => {
                  return (
                    <label key={mode}>
                      {mode}
                      <input type="radio" name={name} />
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.footer}>
        <button className={styles.footerSaveBtn} onClick={() => close(DUMMY_RESULT)}>Save</button>
      </div>

    </div>
  );
};