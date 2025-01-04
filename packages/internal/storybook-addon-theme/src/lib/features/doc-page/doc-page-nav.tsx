import styled from 'styled-components';

import { ColorModeButton } from '../color-mode/color-mode-button';
import { FrameworkSelectionButton } from '../framework-selection/framework-selection-button';
import { ThemeSelectionButton } from '../theme-selection/theme-selection-button';


interface DocPageNavProps {
  hideThemeSwitcher?: boolean;
}

export const DocPageNav = ({hideThemeSwitcher = false}: DocPageNavProps) => {
  return (
    <Nav>
      <FrameworkSelectionButton/>
      <StyledSpacer/>
      { !hideThemeSwitcher && <ThemeSelectionButton/> }
      <ColorModeButton/>
    </Nav>
  );
};

// region ---------------- STYLES ----------------
const Nav = styled.nav`
    width: 100%;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 24px;
    position: sticky;
    top: 0;
    z-index: 10;
    padding: 0 24px;
    backdrop-filter: blur(25px);
    -webkit-backdrop-filter: blur(25px); // Safari 
    border-bottom: 1px solid var(--cck-doc-color-border-2);
`;

const StyledSpacer = styled.div`
  flex: 1;
`;
// endregion