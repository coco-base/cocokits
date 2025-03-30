import styled from "styled-components";

import { Icons } from "@cocokits/common-icons";
import { getInstance } from "@cocokits/common-utils";
import { SvgIcon } from "@cocokits/react-icon";

import { THEMES } from "../../config/addon-theme.config";
import { GlobalEvent } from "../../data-access/global-event/preview-global-event";
import { ColorMode } from "../../model/theme.model";
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
      
      <StyledLabel>{theme.displayName}</StyledLabel>

      <SvgIcon icon={Icons.arrowHeadDown}/>
    </StyledHost>
  );
}


const StyledHost = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 0 12px 0 12px;
  /* border: 1px solid var(--cck-doc-color-border-2); */
  border-radius: 500px 500px;
  gap: 12px;
  cursor: pointer;

  font: var(--cck-doc-text-sm-medium);
  color: var(--cck-doc-color-font-1);

  &:hover {
    background-color: var(--cck-doc-color-bg-hover-2);
  }
`;

const StyledLabel = styled.span`
  .cck-breakpoint--mobile & {
    display: none;
  }
`;