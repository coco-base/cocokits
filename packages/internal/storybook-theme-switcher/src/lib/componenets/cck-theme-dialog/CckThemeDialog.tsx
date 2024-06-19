import React, { useState } from 'react';
import { styled } from 'styled-components';

import { OverlayRef } from '@coco-kits/react-overlay';
import {
  CCK_THEMES_MAP,
  CckTheme,
  CckThemeName,
} from '@coco-kits/storybook-theme-switcher';

import { CckModeSelection } from './CckModeSelection';
import { SelectedThemeModes } from './CckThemeDialog.model';
import { CckThemeSelection } from './CckThemeSelection';


export interface SelectThemeDialogData {
  selectedThemeName: CckThemeName
}

export interface SelectThemeDialogResult {
  themeName: CckThemeName,
  selectedModes: SelectedThemeModes
}

export const CckThemeDialog = ({ data, close }: OverlayRef<SelectThemeDialogData, SelectThemeDialogResult>) => {

  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState<CckTheme>(CCK_THEMES_MAP[data.selectedThemeName]);
  const [selectedModes, setSelectedModes] = useState<SelectedThemeModes>({});


  const onThemeClick = (theme: CckTheme) => {
    setSelectedTheme(theme);
    setSelectedModes(theme.defaultSelectedModes);
    setSelectedTabIndex(1);
  };

  const onModeChanged = (newSelectedModes: SelectedThemeModes) => {
    setSelectedModes(newSelectedModes);
  };

  return (
    <StyledWrapper>
      <StyledHeader>
        { selectedTabIndex === 1 && <button onClick={() => setSelectedTabIndex(0)}>BACK</button>}
        <button onClick={() => close()}>X</button>
      </StyledHeader>

      {
        selectedTabIndex === 0 &&
        <StyledCckThemeSelection
          selectedThemeName={selectedTheme.name}
          onThemeClick={onThemeClick} />
      }
      {
        selectedTabIndex === 1 &&
        <StyledCckModeSelection
          selectedTheme={selectedTheme}
          onModeChanged={onModeChanged} />
      }

      <StyledFooter>
        {
          selectedTabIndex === 1 &&
          <button onClick={() => {
            close({
              themeName: selectedTheme.name,
              selectedModes
            });
          }}>Save</button>
        }
      </StyledFooter>
    </StyledWrapper>

  );
  // const styles = useStyles();
  // const [selectedCckThemeName, setSelectedCckThemeName] = useState<CckThemeName>(data.selectedThemeName);
  // const selectedStorybookTheme = useDocSelectedStorybookTheme();
  //
  // const selectedCollections = useMemo(() => {
  //   const theme = CCK_THEMES[selectedCckThemeName];
  //   return theme ? Object.entries(theme.collections) : null;
  // }, [selectedCckThemeName, data.themeNames]);

  // return (
  //   <div className={styles.wrapper}>
  //
  //     <div className={styles.toolbar}>
  //       <div>Design System Theme</div>
  //       <button className={styles.toolbarCloseBtn} onClick={() => close()}></button>
  //     </div>
  //
  //     <div className={styles.themeWrapper}>
  //       {data.themeNames.map(themeName =>
  //         <div
  //           key={themeName}
  //           className={mergeClasses(
  //             styles.themeItem,
  //             selectedCckThemeName === themeName && styles.themeItemSelected)}
  //           onClick={() => {
  //             setSelectedCckThemeName(themeName);
  //           }}
  //         >
  //           <img
  //             className={styles.themeIcon}
  //             src={selectedStorybookTheme === 'dark' ? CCK_THEMES[themeName].iconPathDark : CCK_THEMES[themeName].iconPathLight}
  //             alt={themeName} />
  //           <div className={styles.themeName}>{themeName}</div>
  //         </div>,
  //       )}
  //     </div>
  //
  //     <hr />
  //
  //     <div className={styles.collectionsSelection}>
  //       {selectedCollections?.map(([name, modes]) => {
  //         return (
  //           <div key={name} className={styles.collectionWrapper}>
  //             <div className={styles.collectionName}>{name}</div>
  //             <div className={styles.collectionModeWrapper}>
  //               {modes.map(mode => {
  //                 return (
  //                   <label key={mode}>
  //                     {mode}
  //                     <input type="radio" name={name} />
  //                   </label>
  //                 );
  //               })}
  //             </div>
  //           </div>
  //         );
  //       })}
  //     </div>
  //
  //     <div className={styles.footer}>
  //       <button className={styles.footerSaveBtn} onClick={() => close(DUMMY_RESULT)}>Save</button>
  //     </div>
  //
  //   </div>
  // );
};

const StyledWrapper = styled.div`
    width: var(--size-560);
    height: var(--size-640);
    display: flex;
    flex-direction: column;
    padding: var(--size-24);
`;

const StyledHeader = styled.div`
    height: var(--size-32);
`;

const StyledCckThemeSelection = styled(CckThemeSelection)`
    flex: 1;
`;
const StyledCckModeSelection = styled(CckModeSelection)`
    flex: 1;
`;

const StyledFooter = styled.div`
    height: var(--size-32);
`;