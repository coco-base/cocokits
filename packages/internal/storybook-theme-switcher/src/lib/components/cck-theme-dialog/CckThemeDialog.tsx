import React, { useState } from 'react';
import { styled } from 'styled-components';

import { OverlayRef } from '@cocokits/react-overlay';
import { CCK_THEMES_MAP, CckTheme, CckThemeId, StorybookThemeName } from '@cocokits/storybook-theme-switcher';

import { CckModeSelection } from './CckModeSelection';
import { SelectedThemeModes } from './CckThemeDialog.model';
import { CckThemeSelection } from './CckThemeSelection';


export interface SelectThemeDialogData {
  selectedThemeId: CckThemeId;
  selectedThemeModes: Record<string, string>;
  storybookThemeName: StorybookThemeName
}

export interface SelectThemeDialogResult {
  themeId: CckThemeId,
  selectedModes: SelectedThemeModes;
  changeStorybookTheme: boolean;
}

export const CckThemeDialog = ({ data, close }: OverlayRef<SelectThemeDialogData, SelectThemeDialogResult>) => {

  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState<CckTheme>(CCK_THEMES_MAP[data.selectedThemeId]);
  const [selectedModes, setSelectedModes] = useState<SelectedThemeModes>({});


  const onThemeClick = (theme: CckTheme) => {
    setSelectedTheme(theme);
    setSelectedModes(theme.defaultSelectedModes);
    setSelectedTabIndex(1);
  };

  const onModeChanged = (newSelectedModes: SelectedThemeModes) => {
    setSelectedModes(newSelectedModes);
  };

  const onCloseClick = () => {
    const lightDarkCollectionModes = data.storybookThemeName === 'light' ? CCK_THEMES_MAP[selectedTheme.id].lightCollectionModes : CCK_THEMES_MAP[selectedTheme.id].darkCollectionModes;
    const hasMismatchLightheartedMode = Object.entries(lightDarkCollectionModes).some(([collection, mode]) => {
      return selectedModes[collection] ? selectedModes[collection] !== mode : false;
    });

    if(hasMismatchLightheartedMode) {
      // eslint-disable-next-line no-alert
      const changeStorybookTheme = confirm(`The documentation page is currently in ${data.storybookThemeName} mode, but you've selected the ${data.storybookThemeName === 'light' ? 'dark' : 'light'} mode for the theme. Some components might not display correctly. Would you like to change the documentation page theme to ${data.storybookThemeName === 'light' ? 'dark' : 'light'} mode as well?`);
      close({
        themeId: selectedTheme.id,
        selectedModes,
        changeStorybookTheme
      });
    }

    close({
      themeId: selectedTheme.id,
      selectedModes,
      changeStorybookTheme: false
    });
  };

  return (
    <StyledWrapper>
      <StyledHeader>
        { selectedTabIndex === 1 &&
          <StyledBackButton onClick={() => setSelectedTabIndex(0)}>
            <svg width="7" height="12" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 11L1 6L6 1" strokeOpacity="0.8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </StyledBackButton>
        }
        <StyledCloseButton onClick={() => close()}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 1L1 13M1 1L13 13" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </StyledCloseButton>
      </StyledHeader>

      {
        selectedTabIndex === 0 &&
        <StyledCckThemeSelection
          selectedThemeId={selectedTheme.id}
          onThemeClick={onThemeClick} />
      }
      {
        selectedTabIndex === 1 &&
        <StyledCckModeSelection
          selectedTheme={selectedTheme}
          storybookThemeName={data.storybookThemeName}
          defaultSelectedThemeModes={data.selectedThemeModes}
          onModeChanged={onModeChanged} />
      }

      <StyledFooter>
        {
          selectedTabIndex === 1 &&
          <StyledSaveButton onClick={onCloseClick}>
            Save
          </StyledSaveButton>
        }
      </StyledFooter>
    </StyledWrapper>

  );
};

const StyledWrapper = styled.div`
    width: var(--cck-storybook-size-560);
    height: var(--cck-storybook-size-640);
    display: flex;
    flex-direction: column;
    padding: var(--cck-storybook-size-24);
    gap: 12px;
`;

const StyledHeader = styled.div`
    height: var(--cck-storybook-size-40);
    display: flex;
    align-items: center;
`;

const StyledBackButton = styled.button`
    border: none;
    outline: none;
    background-color: transparent;
    height: 40px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    gap: 12px;
    font: var(--cck-storybook-text-md-medium);
    color: var(--cck-storybook-color-font-contrast-3);
    stroke: var(--cck-storybook-color-font-contrast-3);
    padding: 0 18px 0 16px;
    cursor: pointer;
    
    &:hover {
        background-color: var(--cck-storybook-color-bg-body-inverse-alpha-5);
    }
`;

const StyledCloseButton = styled.button`
    border: none;
    outline: none;
    background-color: transparent;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    margin-left: auto;
    stroke: var(--cck-storybook-color-font-contrast-3);
    
    &:hover {
        background-color: var(--cck-storybook-color-bg-body-inverse-alpha-5);
    }
`;

const StyledSaveButton = styled.button`
    border: 1px solid var(--cck-storybook-color-brand-alpha-7);
    outline: none;
    background-color: var(--cck-storybook-color-brand-alpha-4);
    height: 32px;
    border-radius: 6px;
    gap: 4px;
    font: var(--cck-storybook-text-md-medium);
    color: var(--cck-storybook-color-brand-default);
    padding: 0 12px;
    cursor: pointer;
    margin-left: auto;
    
    &:hover {
        background-color: var(--cck-storybook-color-brand-alpha-5);
    }
`;

const StyledCckThemeSelection = styled(CckThemeSelection)`
    flex: 1;
    padding: 0 10px;
`;
const StyledCckModeSelection = styled(CckModeSelection)`
    flex: 1;
    padding: 0 10px;
`;

const StyledFooter = styled.div`
    height: var(--cck-storybook-size-32);
    display: flex;
    align-items: center;
`;