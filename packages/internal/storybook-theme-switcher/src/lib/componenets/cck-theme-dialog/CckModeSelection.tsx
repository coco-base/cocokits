import React, { FC, HTMLAttributes, useState } from 'react';
import { css, styled } from 'styled-components';

import { CCK_THEMES_MAP, CckTheme, useDocSelectedStorybookTheme } from '@cocokits/storybook-theme-switcher';

import { SelectedThemeModes } from './CckThemeDialog.model';

type ReactDivAttr = HTMLAttributes<HTMLDivElement>;

interface CckModeSelectionProps {
  selectedTheme: CckTheme;
  defaultSelectedThemeModes: Record<string, string>
  onModeChanged: (selectedModes: SelectedThemeModes) => void;
}

export const CckModeSelection: FC<CckModeSelectionProps & ReactDivAttr> =
  ({ selectedTheme, defaultSelectedThemeModes, onModeChanged, ...props }) => {

    const [selectedModes, setSelectedModes] = useState<SelectedThemeModes>(CCK_THEMES_MAP[selectedTheme.id].defaultSelectedModes);
    const storybookTheme = useDocSelectedStorybookTheme();

    const _onModeChanged = (collectionName: string, mode: string) => {
      const newSelectedModes = {
        ...selectedModes,
        [collectionName]: mode,
      };

      setSelectedModes(newSelectedModes);
      onModeChanged(newSelectedModes);
    };

    return (
      <StyledWrapper {...props}>

        <StyledHeaderWrapper>
          <StyledLogo
            src={storybookTheme === 'dark' ? selectedTheme.iconPathDark : selectedTheme.iconPathLight}></StyledLogo>
          <StyledHeader>{selectedTheme.name}</StyledHeader>
        </StyledHeaderWrapper>

        <StyledDescription>{selectedTheme.description}</StyledDescription>

        <StyledModesList>
          {
            Object.entries(selectedTheme.tokenDictionary.collectionModeNames).map(([collectionName, modes]) => (
              <StyledModesWrapper key={collectionName}>
                <StyledCollectionName>{collectionName}</StyledCollectionName>
                {
                  modes.map((mode, index) => (
                    <RadioWrapper key={mode.name}>
                      <input
                        type="radio"
                        id={mode.name}
                        name={collectionName}
                        defaultChecked={
                          defaultSelectedThemeModes[collectionName]
                            ? defaultSelectedThemeModes[collectionName] === mode.name
                            : index === 0
                        }
                        onChange={() => _onModeChanged(collectionName, mode.name)} />
                      <label htmlFor={mode.name}>
                        {mode.name}
                      </label>
                    </RadioWrapper>
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
    font: var(--cck-storybook-display-sm-semibold);
    color: var(--cck-storybook-color-font-contrast-4);
`;

const StyledDescription = styled.div`
    font: var(--cck-storybook-text-sm-regular);
    color: var(--cck-storybook-color-font-contrast-3);
    margin-bottom: var(--cck-storybook-size-16);
`;

const StyledLogo = styled.img`
    width: var(--cck-storybook-size-32);
    height: var(--cck-storybook-size-32);
`;

const StyledHeaderWrapper = styled.div<ReactDivAttr>`
    display: flex;
    align-items: center;
    gap: var(--cck-storybook-size-24);
    margin-bottom: var(--cck-storybook-size-24);
`;

const StyledModesList = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-top: var(--cck-storybook-size-24);
`;

const StyledModesWrapper = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    min-height: var(--cck-storybook-size-48);

    &:not(:first-of-type) {
        border-top: 1px solid var(--cck-storybook-color-border-alpha-default);
    }
`;

const StyledCollectionName = styled.div`
    flex-shrink: 0;
    width: var(--cck-storybook-size-128);
    font: var(--cck-storybook-text-md-medium);
    color: var(--cck-storybook-color-font-contrast-4);
`;


const RadioWrapper = styled.div`
    min-width: 120px;
    display: flex;
    align-items: center;

    input[type=radio] {
        position: absolute;
        opacity: 0;
    }
    
    label {
        display: flex;
        align-items: center;
        position: relative;
        font: var(--cck-storybook-text-md-regular);
        color: var(--cck-storybook-color-font-contrast-4);
    }

    input[type=radio]:checked + label {
        color: var(--cck-storybook-color-brand-default);
    }

    input[type=radio] + label:before {
        content: "";
        background: transparent;
        border-radius: 100%;
        border: 1px solid var(--cck-storybook-color-font-contrast-4);
        display: inline-block;
        width: 16px;
        height: 16px;
        position: relative;
        margin-right: 8px;
        vertical-align: top;
        cursor: pointer;
        text-align: center;
        transition: all 250ms ease;
    }
    
    input[type="radio"] + label::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 4px;
        transform: translate(0px, -50%);
        width: 10px;
        height: 10px;
        background-color: transparent;
        border-radius: 50%;
        transition: all 250ms ease;
    }

    input[type=radio]:checked + label:before {
        border: 1px solid var(--cck-storybook-color-brand-default);
    }

    input[type="radio"]:checked + label::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 4px;
        transform: translate(0px, -50%);
        width: 10px;
        height: 10px;
        background-color: var(--cck-storybook-color-brand-default);
        border-radius: 50%;
    }
`;
// endregion