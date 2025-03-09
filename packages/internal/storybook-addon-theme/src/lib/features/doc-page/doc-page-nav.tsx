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
      <SelectionWrapper>
        { !hideThemeSwitcher && <ThemeSelectionButton/> }
        <FrameworkSelectionButton/>
      </SelectionWrapper>
      <StyledSpacer/>
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
    background-color: color-mix(in srgb, var(--cck-doc-color-bg-2) 80%, transparent)
`;

const SelectionWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0px;
  border: 1px solid var(--cck-doc-color-border-2);
  border-radius: 500px;
  height: 44px;
  background-color: color-mix(in srgb, var(--cck-doc-color-font-1) 4%, transparent);
`;

const StyledSpacer = styled.div`
  flex: 1;
`;
// endregion