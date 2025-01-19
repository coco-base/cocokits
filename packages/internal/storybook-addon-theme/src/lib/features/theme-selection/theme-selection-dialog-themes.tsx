import styled, { css } from 'styled-components';

import { TokenDictionary } from '@cocokits/core';

import { THEMES } from '../../config/addon-theme.config';
import { ColorMode, ThemeId } from '../../model/theme.model';
import { useColorMode } from '../../utils/use-manager-color-mode';

interface ThemeSelectionDialogThemesProps {
  selectedThemeId: ThemeId;
  onThemeClick: (themeId: ThemeId) => void;
  className?: string;
}

export function ThemeSelectionDialogThemes({
  selectedThemeId,
  onThemeClick,
  className,
}: ThemeSelectionDialogThemesProps) {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === ColorMode.Dark;

  const getTotalModes = (dictionary: TokenDictionary) => {
    return Object.values(dictionary.collectionModeNames).reduce((totalModes, currentModes) => {
      return totalModes + currentModes.length;
    }, 0);
  };

  return (
    <StyledHost className={className}>
      <StyledHeader>Design System Theme</StyledHeader>
      <StyledDescription>
        Select a theme to see a live preview of all components styled according to your chosen theme. This helps you
        visualize how the theme will look across your design system.
      </StyledDescription>

      <StyledThemeWrapper>
        {Object.values(THEMES).map((theme) => (
          <StyledTheme key={theme.id} $selected={selectedThemeId === theme.id} onClick={() => onThemeClick(theme.id)}>
            <StyledThemeBannerWrapper>
              <StyledThemeTag $selected={selectedThemeId === theme.id}>Free</StyledThemeTag>
              <StyledThemeLogo src={isDarkMode ? theme.iconPaths.dark : theme.iconPaths.light} />
            </StyledThemeBannerWrapper>

            <StyledThemeContentWrapper>
              <StyledThemeName>{theme.displayName}</StyledThemeName>
              <StyledThemeLabel>
                {theme.tokenDictionary.collectionNames.length} Collections / {getTotalModes(theme.tokenDictionary)}{' '}
                Modes
              </StyledThemeLabel>
            </StyledThemeContentWrapper>
          </StyledTheme>
        ))}
      </StyledThemeWrapper>
    </StyledHost>
  );
}

const StyledHost = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledHeader = styled.div`
  font: var(--cck-doc-display-sm-semibold);
  color: var(--cck-doc-color-font-1);
  margin-bottom: 24px;
`;

const StyledDescription = styled.div`
  font: var(--cck-doc-text-sm-regular);
  color: var(--cck-doc-color-font-3);
  margin-bottom: 16px;
`;

const StyledThemeWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 48px;
`;

const StyledTheme = styled.div<{ $selected: boolean }>`
  flex: 1;
  height: 224px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid var(--cck-doc-color-border-2);
  border-radius: var(--cck-doc-radius-md);
  background-color: var(--cck-doc-color-bg-2);
  cursor: pointer;

  ${(props) =>
    props.$selected &&
    css`
      border: 2px solid var(--cck-doc-color-brand-default);
    `}
`;

const StyledThemeBannerWrapper = styled.div`
  flex: 1;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  height: 120px;
  overflow: hidden;
  border-radius: var(--cck-doc-radius-md);
`;

const StyledThemeTag = styled.div<{ $selected: boolean }>`
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font: var(--cck-doc-text-xs-semibold);
  color: var(--cck-doc-color-font-2);
  padding: 0 12px;
  border-radius: 100px;
  background-color: var(--cck-doc-color-bg-4);

  ${(props) =>
    props.$selected &&
    css`
      background-color: var(--cck-doc-color-bg-selected-2);  
    `}
`;

const StyledThemeLogo = styled.img`
  width: 40px;
  height: 40px;
`;

const StyledThemeContentWrapper = styled.div`
  width: 100%;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background-color: var(--cck-doc-color-bg-1);
  border-radius: var(--cck-doc-radius-md);
`;

const StyledThemeName = styled.div`
  font: var(--cck-doc-text-md-medium);
  color: var(--cck-doc-color-font-1);
`;

const StyledThemeLabel = styled.div`
  font: var(--cck-doc-text-sm-regular);
  color: var(--cck-doc-color-font-3);
`;
