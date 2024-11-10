import { ReactNode } from 'react';
import styled from 'styled-components';

import { DocCategory } from './DocCategory';
import { DocPage } from './DocPage';
import { DocToc, DocTocProps } from './DocToc';

interface DocPageProps {
  children: ReactNode;
  groupTitle?: string;
  utilsPage?: boolean;
  toc?: DocTocProps['items'],
  hideCckThemeSwitcher?: boolean
}

export const MdxDocPage = ({children, groupTitle, toc, utilsPage, hideCckThemeSwitcher = false}: DocPageProps) => {

  return (
    <>
      <DocPage hideCckThemeSwitcher={hideCckThemeSwitcher} utilsPage={utilsPage}>
        <StyledWrapper>
          <StyledMain>
            {groupTitle && <DocCategory>{groupTitle}</DocCategory>}
            {children}
          </StyledMain>
          { toc && toc.length > 0 &&
            <DocToc items={toc} />
          }
        </StyledWrapper>
      </DocPage>
    </>
  );
};

// region ---------------- STYLES ----------------
export const StyledWrapper = styled.div`
    display: flex;
    position: relative;
    width: 100%;
    margin: auto;
`;

const StyledMain = styled.main`
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: var(--cck-storybook-size-64) var(--cck-storybook-size-32) var(--cck-storybook-size-128) var(--cck-storybook-size-32);
    margin: 0 auto;
    z-index: 1;
    min-width: 0;
`;
// endregion