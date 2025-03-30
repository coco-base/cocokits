import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { Icons } from '@cocokits/common-icons';
import { IconButton } from '@cocokits/react-button';
import { SvgIcon } from '@cocokits/react-icon';

import { ColorModeButton } from '../color-mode/color-mode-button';
import { FrameworkSelectionButton } from '../framework-selection/framework-selection-button';
import { ThemeSelectionButton } from '../theme-selection/theme-selection-button';


interface DocPageNavProps {
  hideThemeSwitcher?: boolean;
}

export const DocPageNav = ({hideThemeSwitcher = false}: DocPageNavProps) => {

  const [originalStorybookMenu, setOriginalStorybookMenu] = useState<HTMLButtonElement | null>(
    window.parent.document.querySelector<HTMLButtonElement>('#root > div:first-child > div:nth-child(3) > .sb-bar button')
  );

  useEffect(() => {
    const resizeCallback = () => {
      setOriginalStorybookMenu(window.parent.document.querySelector<HTMLButtonElement>('#root > div:first-child > div:nth-child(3) > .sb-bar button'));
    };

    window.addEventListener('resize', resizeCallback);
    return () => window.removeEventListener('resize', resizeCallback);
  }, []);

  const onMobileMenuClick = () => {
    if (originalStorybookMenu) {
      originalStorybookMenu.click();
    }
  };

  return (
    <Nav>
      <SelectionWrapper>
        { !hideThemeSwitcher && <ThemeSelectionButton/> }
        <FrameworkSelectionButton/>
      </SelectionWrapper>

      <StyledSpacer/>

      <ColorModeButton/>

      {originalStorybookMenu && (
        <StyledMenuButton onClick={onMobileMenuClick}>
          <SvgIcon icon={Icons.menu}/>
        </StyledMenuButton>
      )}
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
    background-color: color-mix(in srgb, var(--cck-doc-color-bg-2) 80%, transparent);

    .cck-breakpoint--mobile & {
      position: fixed;
      bottom: 0;
      top: initial;
      gap: 0px;
    }
`;

const SelectionWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0px;
  border: 1px solid var(--cck-doc-color-border-2);
  border-radius: 500px;
  height: 44px;
  background-color: color-mix(in srgb, var(--cck-doc-color-font-1) 4%, transparent);

  & > * {
    flex-shrink: 0;
  }

  .cck-breakpoint--mobile & {
    height: 34px;
  }
`;

const StyledSpacer = styled.div`
  flex: 1;
`;

const StyledMenuButton = styled(IconButton)`
  display: none;

  .cck-breakpoint--mobile & {
    display: flex;
  }
`;
// endregion