import { Source } from '@storybook/addon-docs';
import { SupportedLanguage } from '@storybook/components';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';


interface MdxDocTabCodeProps {
  codeTabs: { [key: string]: string };
  language?: SupportedLanguage
}


export const MdxDocTabCode = ({ codeTabs, language }: MdxDocTabCodeProps) => {

  const [activeTab, setActiveTab] = useState<string>(Object.keys(codeTabs)[0]);

  return (
    <>
      <StyledTabs>
        {Object.keys(codeTabs).map((tab) => (
          <StyledTabButton
            key={tab}
            $isActive={tab === activeTab}
            onClick={() => setActiveTab(tab)}>
            {tab}
          </StyledTabButton>
        ))}
      </StyledTabs>
      <StyledPre>
        <Source language={language} code={codeTabs[activeTab]}>
        </Source>
      </StyledPre>
    </>
  );
};


// region ---------------- STYLES ----------------
const StyledTabs = styled.div`
    display: flex;
    margin: 0 4px;
`;

const StyledTabButton = styled.button<{ $isActive: boolean }>`
    padding: 10px 16px;
    outline: none;
    cursor: pointer;
    border: none;
    border-radius: 4px 4px 0 0;
    background-color: transparent;
    font: var(--cck-storybook-text-sm-regular);
    color: var(--cck-storybook-color-font-contrast-3);

    ${props => props.$isActive && css`
        background-color: var(--cck-storybook-color-brand-alpha-4);
        border-bottom: 2px solid var(--cck-storybook-color-brand-default);
    `}
`;
const StyledPre = styled.pre`
    margin: 0;

    .docblock-source {
        margin: 0;
    }
`;


// endregion