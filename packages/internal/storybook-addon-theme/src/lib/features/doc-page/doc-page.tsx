import { ReactNode } from "react";
import styled from "styled-components";

import { DocPageBgEffect } from "./doc-page-bg-effect";
import { DocPageHeader } from "./doc-page-header";
import { DocPageNav } from "./doc-page-nav";
import { DocPageToc, DocTocItem } from "./doc-page-toc";

export interface DocPageProps {
  breadcrumb?: string;
  title?: string;
  hideThemeSwitcher?: boolean;
  tocItems?: DocTocItem[],
  children: ReactNode | ReactNode[];
}



export const DocPage = (props: DocPageProps) => {

  const tocItems = props.tocItems ?? [{id: '', name: ''}];

  return (
    // sb-unstyled class remove default storybook styles
    <StyledHost className={`sb-unstyled`}>
      <DocPageNav/>
      <DocPageBgEffect/>

      <StyledContentWrapper>
        <StyledDocPageHeader title={props.title} breadcrumb={props.breadcrumb}/>
        <StyledMain>{props.children}</StyledMain>
        <StyledDocPageToc items={tocItems}/>
      </StyledContentWrapper>

    </StyledHost>
  );
};


const StyledHost = styled.div`
    background-color: var(--cck-doc-color-bg-1);
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
`;

const StyledContentWrapper = styled.div`
    display: grid;
    grid-template-rows: auto 1fr;
    grid-template-columns: 1fr auto;
    position: relative;
    width: 100%;
    margin: 0 auto;
    max-width: 1100px;
    padding: 64px 48px 256px 48px;
`;

const StyledDocPageHeader = styled(DocPageHeader)`
  grid-row: 1;
  grid-column: 1 / -1;  // spans all columns
  margin: 2px;
`;

const StyledMain = styled.main`
  grid-row: 2;
  grid-column: 1;
  margin: 2px;
  padding-bottom: 256px;
  overflow: hidden;
`;

const StyledDocPageToc = styled(DocPageToc)`
  grid-row: 2;
  grid-column: 2;
  min-width: 150px;
  max-width: 350px;
  margin: 2px;

  overflow-y: auto;
  max-height: calc(100vh - 80px);
  align-self: start;
  position: sticky;
  flex-shrink: 0;
  top: 80px;
  margin-top: 0;
  margin-left: 64px;

  border: 1px solid rgba(255, 255, 255, 0.5);

  // IFrame inside of Storybook Doc page
  @media (max-width: 880px) {
    display: none;
  }
`;
