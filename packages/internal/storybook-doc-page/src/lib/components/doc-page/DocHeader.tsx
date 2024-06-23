import styled from 'styled-components';

import { DocCckStorybookThemeSwitcher, DocCckThemeSwitcher } from '@coco-kits/storybook-theme-switcher';


interface DocHeaderProps {
  hideCckThemeSwitcher?: boolean;
}

export const DocHeader = ({hideCckThemeSwitcher = false}: DocHeaderProps) => {
  return (
    <Nav>
      { !hideCckThemeSwitcher && <DocCckThemeSwitcher></DocCckThemeSwitcher> }
      <FlexSpacer></FlexSpacer>
      <DocCckStorybookThemeSwitcher></DocCckStorybookThemeSwitcher>
    </Nav>
  );
};

// region ---------------- STYLES ----------------
const Nav = styled.nav`
    width: 100%;
    height: var(--cck-storybook-size-64);
    display: flex;
    align-items: center;
    position: sticky;
    top: var(--cck-storybook-size-0);
    z-index: 10;
    padding: var(--cck-storybook-size-0) var(--cck-storybook-size-24);
    background-color: var(--cck-storybook-color-bg-body-alpha-6);
    backdrop-filter: blur(var(--cck-storybook-blur-4));
    -webkit-backdrop-filter: blur(var(--cck-storybook-blur-4)); // Safari 
    border-bottom: 1px solid var(--cck-storybook-color-brand-alpha-5);
`;

const FlexSpacer = styled.div`
  flex: 1;
`;
// endregion