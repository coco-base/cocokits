import styled from 'styled-components';

import { RadioButton, RadioGroup } from '@cocokits/react-radio';

import { THEMES } from '../../config/addon-theme.config';
import { ColorMode, ThemeId } from '../../model/theme.model';
import { useColorMode } from '../../utils/use-manager-color-mode';

interface ThemeSelectionDialogModesProps {
  selectedThemeId: ThemeId;
  selectedThemeModes: Record<string, string>;
  className?: string;
  onModeChanged: (selectedModes: Record<string, string>) => void;
}

export function ThemeSelectionDialogModes({
  selectedThemeId,
  selectedThemeModes,
  className,
  onModeChanged,
}: ThemeSelectionDialogModesProps) {
  const { colorMode } = useColorMode();
  const selectedTheme = THEMES[selectedThemeId];
  const isDarkMode = colorMode === ColorMode.Dark;
  const logoSrc = isDarkMode ? selectedTheme.iconPaths.dark : selectedTheme.iconPaths.light;

  const _onModeChanged = (collectionName: string, mode: string) => {
    const newSelectedModes = {
      ...selectedThemeModes,
      [collectionName]: mode,
    };

    onModeChanged(newSelectedModes);
  };

  return (
    <StyledHost className={className}>
      <StyledHeaderWrapper>
        <StyledLogo src={logoSrc}></StyledLogo>
        <StyledHeader>{selectedTheme.displayName}</StyledHeader>
      </StyledHeaderWrapper>

      <StyledDescription>{selectedTheme.description}</StyledDescription>

      <StyledModesList>
        {Object.entries(selectedTheme.tokenDictionary.collectionModeNames).map(([collectionName, modes]) => (

          <StyledModesWrapper key={collectionName}>
            <StyledCollectionName>{collectionName}</StyledCollectionName>

            <StyledRadioGroup
              selected={selectedThemeModes[collectionName]}
              onChange={(event) => _onModeChanged(collectionName, event.value)}>
              {modes.map((mode) => (
                <StyledRadioButton key={mode.name} value={mode.name}>
                  {mode.name}
                </StyledRadioButton>
              ))}
            </StyledRadioGroup>

          </StyledModesWrapper>

        ))}
      </StyledModesList>
    </StyledHost>
  );
}

const StyledHost = styled.div`
  display: flex;
  flex-direction: column;
  overflow: auto;
`;

const StyledHeader = styled.div`
  font: var(--cck-doc-display-md-semibold);
  color: var(--cck-doc-color-font-1);
`;

const StyledDescription = styled.div`
  font: var(--cck-doc-text-sm-regular);
  color: var(--cck-doc-color-font-2);
  margin-bottom: 16px;
`;

const StyledLogo = styled.img`
  width: 32px;
  height: 32px;
`;

const StyledHeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 24px;
`;

const StyledModesList = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-top: 24px;
`;

const StyledModesWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-height: 48px;
  padding: 8px 0;

  &:not(:first-of-type) {
    border-top: 1px solid var(--cck-doc-color-border-1);
  }
`;

const StyledCollectionName = styled.div`
  flex-shrink: 0;
  width: 128px;
  font: var(--cck-doc-text-md-medium);
  color: var(--cck-doc-color-font-1);
`;

const StyledRadioGroup = styled(RadioGroup<string>)`
  flex-wrap: wrap;
`;

const StyledRadioButton = styled(RadioButton)`
  min-width: 110px;
`;