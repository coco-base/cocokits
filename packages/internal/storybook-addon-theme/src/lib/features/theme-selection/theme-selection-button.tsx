import styled from "styled-components";

import { getInstance } from "@cocokits/common-utils";
import { SvgIcon } from "@cocokits/react-icon";

import { THEMES } from "../../config/addon-theme.config";
import { GlobalEvent } from "../../data-access/global-event/preview-global-event";
import { ColorMode } from "../../model/theme.model";
import { Icons } from "../../utils/icons";
import { useColorMode } from "../../utils/use-preview-color-mode";
import { useTheme } from "../../utils/use-preview-theme";

export function ThemeSelectionButton() {

  const globalEvent = getInstance(GlobalEvent);
  const theme = useTheme();
  const { colorMode } = useColorMode();

  const logoSrc = colorMode === ColorMode.Dark ? THEMES[theme.id].iconPaths.dark : THEMES[theme.id].iconPaths.light;

  const onHostClick = () => {
    globalEvent.dispatch.openThemeSelection();
  };

  return (
    <StyledHost onClick={onHostClick}>
      <img
        width="24px"
        src={logoSrc}
        alt={theme.displayName} />
      
      <span>{theme.displayName}</span>

      <SvgIcon icon={Icons.arrowHeadDown}/>
    </StyledHost>
  );
}


const StyledHost = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 44px;
  padding: 0 12px 0 12px;
  border: 1px solid var(--cck-doc-color-border-2);
  border-radius: var(--cck-doc-radius-sm);
  gap: 12px;
  cursor: pointer;

  font: var(--cck-doc-text-sm-medium);
  color: var(--cck-doc-color-font-1);

  &:hover {
    background-color: var(--cck-doc-color-bg-hover-1);
  }
`;