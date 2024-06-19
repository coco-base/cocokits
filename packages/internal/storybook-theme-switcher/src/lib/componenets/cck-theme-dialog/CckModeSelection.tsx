import React, { FC, HTMLAttributes, useState } from 'react';
import { css, styled } from 'styled-components';

import { CCK_THEMES_MAP, CckTheme, useDocSelectedStorybookTheme } from '@coco-kits/storybook-theme-switcher';

import { SelectedThemeModes } from './CckThemeDialog.model';

type ReactDivAttr = HTMLAttributes<HTMLDivElement>;

interface CckModeSelectionProps {
  selectedTheme: CckTheme;
  onModeChanged: (selectedModes: SelectedThemeModes) => void;
}

export const CckModeSelection: FC<CckModeSelectionProps & ReactDivAttr> =
  ({ selectedTheme, onModeChanged, ...props }) => {

    const [selectedModes, setSelectedModes] = useState<SelectedThemeModes>(CCK_THEMES_MAP[selectedTheme.name].defaultSelectedModes);
    const storybookTheme = useDocSelectedStorybookTheme();

    const _onModeChanged = (collectionName: string, mode: string) => {
      const newSelectedModes = {
        ...selectedModes,
        [collectionName]: mode
      };

      setSelectedModes(newSelectedModes);
      onModeChanged(newSelectedModes);
    };

    return (
      <StyledWrapper {...props}>

        <StyledHeaderWrapper>
          <StyledLogo src={storybookTheme === 'dark' ? selectedTheme.iconPathDark : selectedTheme.iconPathLight}></StyledLogo>
          <StyledHeader>{selectedTheme.name}</StyledHeader>
        </StyledHeaderWrapper>

        <StyledDescription>{selectedTheme.description}</StyledDescription>

        <StyledModesList>
          {
            Object.entries(selectedTheme.collections).map(([collectionName, modes]) => (
              <StyledModesWrapper key={collectionName}>
                <StyledCollectionName>{collectionName}</StyledCollectionName>
                {
                  modes.map(mode => (
                    <StyledModeLabel
                      key={mode}
                      selected={selectedModes[collectionName] === mode}
                      onChange={() => _onModeChanged(collectionName, mode)}>
                      <input type="radio" name={collectionName} value={mode} defaultChecked={selectedModes[collectionName] === mode}/>
                      {mode}
                    </StyledModeLabel>
                  ))
                }
              </StyledModesWrapper>
            ))
          }

        </StyledModesList>

      </StyledWrapper>
    );
  };

// region ---------------- STYLES ----------------
const StyledWrapper = styled.div<ReactDivAttr>`
    display: flex;
    flex-direction: column;
`;

const StyledHeader = styled.div`
    font: var(--display-sm-semibold);
    color: var(--color-font-contrast-4);
`;

const StyledDescription = styled.div`
    font: var(--text-sm-regular);
    color: var(--color-font-contrast-3);
    margin-bottom: var(--size-16);
`;

const StyledLogo = styled.img`
    width: var(--size-32);
    height: var(--size-32);
`;

const StyledHeaderWrapper = styled.div<ReactDivAttr>`
    display: flex;
    align-items: center;
    gap: var(--size-24);
    margin-bottom: var(--size-24);
`;

const StyledModesList = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-top: var(--size-24);
`;

const StyledModesWrapper = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    min-height: var(--size-48);

    &:not(:first-of-type) {
        border-top: 1px solid var(--color-border-alpha-default);
    }
`;

const StyledCollectionName = styled.div`
    width: var(--size-128);
    font: var(--text-md-medium);
    color: var(--color-font-contrast-4);
`;

const StyledModeLabel = styled.label<{ selected: boolean }>`
    width: var(--size-128);
    display: flex;
    align-items: center;
    gap: var(--size-6);
    font: var(--text-md-regular);
    color: var(--color-font-contrast-2);
    cursor: pointer;

    ${props => props.selected && css`
        color: var(--color-brand-default);
        font: var(--text-md-medium);
    `},
`;
// endregion