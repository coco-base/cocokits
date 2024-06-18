import styled from 'styled-components';

import { DocCckStorybookThemeSwitcher, DocCckThemeSwitcher } from '@coco-kits/storybook-theme-switcher';


export const DocHeader = () => {
  return (
    <Nav>
      <DocCckThemeSwitcher></DocCckThemeSwitcher>
      <FlexSpacer></FlexSpacer>
      <DocCckStorybookThemeSwitcher></DocCckStorybookThemeSwitcher>
    </Nav>
  );
};

// region ---------------- STYLES ----------------
const Nav = styled.nav`
    width: 100%;
    height: var(--size-14);
    display: flex;
    align-items: center;
    position: sticky;
    top: var(--size-0);
    z-index: 10;
    padding: var(--size-0) var(--size-9);
    background-color: var(--color-bg-body-alpha-6);
    backdrop-filter: blur(var(--blur-4));
    border-bottom: 1px solid var(--color-brand-alpha-5);
`;

const FlexSpacer = styled.div`
  flex: 1;
`;
// endregion