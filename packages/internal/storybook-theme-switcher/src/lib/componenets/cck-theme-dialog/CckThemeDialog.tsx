import React, { useState } from 'react';
import { styled } from 'styled-components';

import { OverlayRef } from '@cocokits/react-overlay';
import { CCK_THEMES_MAP, CckTheme, CckThemeId } from '@cocokits/storybook-theme-switcher';

import { CckModeSelection } from './CckModeSelection';
import { SelectedThemeModes } from './CckThemeDialog.model';
import { CckThemeSelection } from './CckThemeSelection';


export interface SelectThemeDialogData {
  selectedThemeId: CckThemeId
}

export interface SelectThemeDialogResult {
  themeId: CckThemeId,
  selectedModes: SelectedThemeModes
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

  return (
    <StyledWrapper>
      <StyledHeader>
        { selectedTabIndex === 1 && <button onClick={() => setSelectedTabIndex(0)}>BACK</button>}
        <button onClick={() => close()}>X</button>
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
          onModeChanged={onModeChanged} />
      }

      <StyledFooter>
        {
          selectedTabIndex === 1 &&
          <button onClick={() => {
            close({
              themeId: selectedTheme.id,
              selectedModes
            });
          }}>Save</button>
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
`;

const StyledHeader = styled.div`
    height: var(--cck-storybook-size-32);
`;

const StyledCckThemeSelection = styled(CckThemeSelection)`
    flex: 1;
`;
const StyledCckModeSelection = styled(CckModeSelection)`
    flex: 1;
`;

const StyledFooter = styled.div`
    height: var(--cck-storybook-size-32);
`;