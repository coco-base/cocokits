import { useState } from 'react';
import styled from 'styled-components';

import { Icons } from "@cocokits/common-icons";
import { Button, IconButton } from '@cocokits/react-button';
import { SvgIcon } from '@cocokits/react-icon';
import { OverlayRef } from '@cocokits/react-overlay';

import { ThemeSelectionDialogModes } from './theme-selection-dialog-modes';
import { ThemeSelectionDialogThemes } from './theme-selection-dialog-themes';
import { THEMES } from '../../config/addon-theme.config';
import { SelectedTheme, ThemeId } from '../../model/theme.model';
import { useTheme } from '../../utils/use-manager-theme';

export function ThemeSelectionDialog({ close }: OverlayRef<void, SelectedTheme>) {
  const theme = useTheme();
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [selectedThemeId, setSelectedThemeId] = useState(theme.id);
  const [selectedThemeModes, setSelectedThemeModes] = useState(theme.selectedModes);

  const onThemeClick = (themeId: ThemeId) => {
    setSelectedThemeId(themeId);
    setSelectedPageIndex(1);
    setSelectedThemeModes(themeId === theme.id ? theme.selectedModes : THEMES[themeId].defaultSelectedModes);
  };

  const onModeChanged = (newSelectedModes: Record<string, string>) => {
    setSelectedThemeModes(newSelectedModes);
  };

  const onCloseClick = () => {
    close();
  };

  const onSaveClick = () => {
    close({
      id: selectedThemeId,
      selectedModes: selectedThemeModes,
    });
  };

  return (
    <StyledHost>
      <StyledHeader>
        {selectedPageIndex === 1 && (
          <Button onClick={() => setSelectedPageIndex(0)}>
            <SvgIcon icon={Icons.arrowHeadLeft}></SvgIcon>
            Back
          </Button>
        )}

        <StyledCloseButton onClick={onCloseClick}>
          <SvgIcon icon={Icons.close}></SvgIcon>
        </StyledCloseButton>
      </StyledHeader>

      {selectedPageIndex === 0 && (
        <StyledThemeSelectionDialogThemes onThemeClick={onThemeClick} selectedThemeId={selectedThemeId} />
      )}

      {selectedPageIndex === 1 && (
        <StyledThemeSelectionDialogModes
          onModeChanged={onModeChanged}
          selectedThemeId={selectedThemeId}
          selectedThemeModes={selectedThemeModes}
        />
      )}

      <StyledFooter>
        {selectedPageIndex === 1 && (
          <Button type="outline" size="sm" onClick={onSaveClick}>
            Save
          </Button>
        )}
      </StyledFooter>
    </StyledHost>
  );
}

const StyledHost = styled.div`
  width: 98vw;
  height: 98vh;
  max-width: 560px;
  max-height: 640px;
  display: flex;
  flex-direction: column;
  padding: 24px;
  gap: 12px;
  background-color: var(--cck-doc-color-bg-1);
  border-radius: var(--cck-doc-radius-md);
`;

const StyledHeader = styled.div`
  height: 40px;
  display: flex;
  align-items: center;
`;

const StyledCloseButton = styled(IconButton)`
  margin-left: auto;
`;

const StyledFooter = styled.div`
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const StyledThemeSelectionDialogThemes = styled(ThemeSelectionDialogThemes)`
  flex: 1;
  padding: 0 10px;
`;

const StyledThemeSelectionDialogModes = styled(ThemeSelectionDialogModes)`
  flex: 1;
  padding: 0 10px;
`;
