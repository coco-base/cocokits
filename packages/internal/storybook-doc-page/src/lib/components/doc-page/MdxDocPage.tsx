import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { DocPage } from './DocPage';
import { DocCategory } from './DocCategory';

interface DocPageProps {
  children: ReactNode;
  groupTitle?: string;
}

export const MdxDocPage = ({children, groupTitle}: DocPageProps) => {

  return (
    <>
      <DocPage hideCckThemeSwitcher={true}>
        <StyledWrapper>
          {groupTitle && <DocCategory>{groupTitle}</DocCategory>}
          {children}
        </StyledWrapper>
      </DocPage>
    </>
  );
};

// region ---------------- STYLES ----------------
export const StyledWrapper = styled.div`
    position: relative;
    width: 100%;
    margin: auto;
    padding: var(--cck-storybook-size-64) var(--cck-storybook-size-32) var(--cck-storybook-size-128) var(--cck-storybook-size-32);
    overflow: hidden;
`;
// endregion