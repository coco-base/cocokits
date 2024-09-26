import React, { ReactNode } from 'react';
import styled from 'styled-components';

import { DocBgEffect } from './DocBgEffect';
import { DocHeader } from './DocHeader';

interface DocPageProps {
  children: ReactNode;
  utilsPage?: boolean;
  hideCckThemeSwitcher?: boolean;
}

export const DocPage = ({children, hideCckThemeSwitcher = false, utilsPage = false}: DocPageProps) => {

  return (
    // sb-unstyled: Remove default storybook styles
    <StyledWrapper className={`sb-unstyled ${utilsPage ? 'utils-doc-page' : ''}`}>
      <DocBgEffect></DocBgEffect>
      <DocHeader hideCckThemeSwitcher={hideCckThemeSwitcher}></DocHeader>
      <StyledContentWrapper>
        {children}
      </StyledContentWrapper>
    </StyledWrapper>
  );
};

// region ---------------- STYLES ----------------
export const StyledWrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

const StyledContentWrapper = styled.div`
    display: flex;
    position: relative;
    width: 100%;
    max-width: var(--cck-storybook-size-1280);
    margin: auto;
`;
// endregion