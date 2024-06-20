import React, { FC } from 'react';
import { css, styled } from 'styled-components';

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

    return (
      <StyledWrapper {...props}>
        <StyledHeader>Design System Theme</StyledHeader>
        <StyledDescription>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
          invidunt
          ut labore et. Lorem ipsum dolor sit</StyledDescription>
        <StyledThemeWrapper>
          {Object.values(CCK_THEMES_MAP).map(theme => (
            <StyledTheme
              key={theme.id}
              selected={selectedThemeId === theme.id}
              onClick={() => onThemeClick(theme)}>
              <StyledThemeLogo src={storybookTheme === 'dark' ? theme.iconPathDark : theme.iconPathLight} />
              <StyledThemeName>{theme.name}</StyledThemeName>
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
    justify-content: space-evenly;
    align-items: center;
`;

const StyledTheme = styled.div<{ selected: boolean }>`
    width: var(--cck-storybook-size-128);
    height: var(--cck-storybook-size-128);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 12px;
    border: 1px solid var(--cck-storybook-color-border-alpha-default);
    border-radius: var(--cck-storybook-size-6);
    background-color: var(--cck-storybook-color-bg-body-inverse-alpha-2);
    cursor: pointer;

    ${props => props.selected && css`
        border: 1px solid var(--cck-storybook-color-brand-default);
        background-color: var(--cck-storybook-color-brand-alpha-4);
    `},
`;

const StyledThemeLogo = styled.img`
    width: var(--cck-storybook-size-40);
    height: var(--cck-storybook-size-40);
`;

const StyledThemeName = styled.div`
    font: var(--cck-storybook-text-md-medium);
    color: var(--cck-storybook-color-font-contrast-4);
`;
// endregion