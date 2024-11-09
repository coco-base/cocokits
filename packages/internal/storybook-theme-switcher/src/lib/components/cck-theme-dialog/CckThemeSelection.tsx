import { FC } from 'react';
import { css, styled } from 'styled-components';

import { TokenDictionary } from '@cocokits/core';

import { ReactDivAttr } from './CckThemeDialog.model';
import { CCK_THEMES_MAP } from '../../config/cck-theme.config';
import { CckTheme, CckThemeId } from '../../config/cck-themes.model';
import { useDocSelectedStorybookTheme } from '../../hooks/useDocSelectedStorybookTheme';


interface CckThemeSelectionProps {
  selectedThemeId: CckThemeId;
  onThemeClick: (theme: CckTheme) => void;
}

export const CckThemeSelection: FC<CckThemeSelectionProps & ReactDivAttr> =
  ({ selectedThemeId, onThemeClick, ...props }) => {
    const storybookTheme = useDocSelectedStorybookTheme();

    const getTotalModes = (dictionary: TokenDictionary) => {
      return Object.values(dictionary.collectionModeNames).reduce((totalModes, currentModes) => {
        return totalModes + currentModes.length;
      }, 0);
    };

    return (
      <StyledWrapper {...props}>
        <StyledHeader>Design System Theme</StyledHeader>
        <StyledDescription>
          Select a theme to see a live preview of all components styled according to your chosen theme.
          This helps you visualize how the theme will look across your design system.
        </StyledDescription>
        <StyledThemeWrapper>
          {Object.values(CCK_THEMES_MAP).map(theme => (
            <StyledTheme
              key={theme.id}
              $selected={selectedThemeId === theme.id}
              onClick={() => onThemeClick(theme)}>
              <StyledThemeBannerWrapper>
                <StyledThemeTag $selected={selectedThemeId === theme.id}>Free</StyledThemeTag>
                <StyledThemeLogo src={storybookTheme === 'dark' ? theme.iconPathDark : theme.iconPathLight} />
              </StyledThemeBannerWrapper>

              <StyledThemeContentWrapper>
                <StyledThemeName>{theme.name}</StyledThemeName>
                <StyledThemeLabel>
                  {theme.tokenDictionary.collectionNames.length} Collections / {getTotalModes(theme.tokenDictionary)} Modes
                </StyledThemeLabel>
              </StyledThemeContentWrapper>
            </StyledTheme>
          ))}
        </StyledThemeWrapper>
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
    margin-bottom: var(--cck-storybook-size-24);
`;

const StyledDescription = styled.div`
    font: var(--cck-storybook-text-sm-regular);
    color: var(--cck-storybook-color-font-contrast-3);
    margin-bottom: var(--cck-storybook-size-16);
`;

const StyledThemeWrapper = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    gap: 48px;
`;

const StyledTheme = styled.div<{ $selected: boolean }>`
    flex: 1;
    height: var(--cck-storybook-size-224);
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 1px solid var(--cck-storybook-color-border-alpha-default);
    border-radius: var(--cck-storybook-size-6);
    background-color: var(--cck-storybook-color-bg-body-inverse-alpha-2);
    cursor: pointer;

    ${props => props.$selected && css`
        border: 2px solid var(--cck-storybook-color-brand-default);
        //background-color: var(--cck-storybook-color-brand-alpha-4);
    `},
`;

const StyledThemeBannerWrapper = styled.div`
    flex: 1;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    background-color: var(--cck-storybook-color-bg-body-inverse-alpha-2);
    height: 120px;
    overflow: hidden;
`;

const StyledThemeTag = styled.div<{ $selected: boolean }>`
    position: absolute;
    top: 8px;
    right: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font: var(--cck-storybook-text-xs-semibold);
    color: var(--cck-storybook-color-font-contrast-3);
    padding: 0 12px;
    border-radius: 100px;
    background-color: var(--cck-storybook-color-brand-alpha-4);
    
    ${props => props.$selected && css`
        background-color: var(--cck-storybook-color-brand-alpha-6);
    `},
`;

const StyledThemeLogo = styled.img`
    width: var(--cck-storybook-size-40);
    height: var(--cck-storybook-size-40);
`;

const StyledThemeContentWrapper = styled.div`
    width: 100%;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const StyledThemeName = styled.div`
    font: var(--cck-storybook-text-md-medium);
    color: var(--cck-storybook-color-font-contrast-4);
`;

const StyledThemeLabel = styled.div`
    font: var(--cck-storybook-text-sm-regular);
    color: var(--cck-storybook-color-font-contrast-2);
`;
// endregion