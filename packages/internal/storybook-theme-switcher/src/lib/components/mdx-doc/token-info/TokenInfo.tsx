import styled from 'styled-components';

import { Token, TokenMap } from '@cocokits/core';

import { TokenSection } from './TokenSection';
import { TokenValuePreview } from './TokenValuePreview';
import { TokenValues } from './TokenValues';
import { hasTokenPreview } from './utils';

interface TokenInfoProp {
  token: Token;
  tokenMap: TokenMap;
  close: () => void;
}

export function TokenInfo({ token, tokenMap, close }: TokenInfoProp) {
  const hasPreview = hasTokenPreview(token);
  return (
    <StylesWrapper>

      <StylesHeader>
        <h3>Token Info</h3>
        <StyledCloseButton onClick={() => close()}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 1L1 13M1 1L13 13" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </StyledCloseButton>
      </StylesHeader>

      <StylesContent>
        {/* Name & Preview */}
        <StylesRow>
          <TokenSection title="Name">
            <StylesName>{token.namePath.join(' / ')}</StylesName>
          </TokenSection>
          {
            hasPreview &&
            <TokenSection title="Preview">
              <TokenValuePreview token={token} tokenMap={tokenMap} />
            </TokenSection>
          }
        </StylesRow>

        {/* Values */}
        <TokenSection title="Value Hierarchy">
          <TokenValues token={token} tokenMap={tokenMap}></TokenValues>
        </TokenSection>

        {/* CSS */}
        <TokenSection title="CSS Variable">
          <code>{token.variable.css}</code>
        </TokenSection>

        {/* SCSS */}
        <TokenSection title="SCSS Variable">
          <code>{token.variable.scss}</code>
        </TokenSection>
      </StylesContent>

    </StylesWrapper>
  );
}

const StylesWrapper = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: var(--cck-storybook-color-bg-body-inverse-alpha-2);
    border: 1px solid var(--cck-storybook-color-border-alpha-default);
    padding: 12px 12px 12px 24px;
    border-radius: 6px;

    & code {
        align-self: baseline;
        font: var(--cck-storybook-text-sm-regular);
        padding: var(--cck-storybook-size-2) var(--cck-storybook-size-6);
        color: var(--cck-storybook-color-font-contrast-4);
    }
`;

const StylesHeader = styled.div`
    display: flex;
`;


const StylesContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 32px;
`;


const StyledCloseButton = styled.button`
    border: none;
    outline: none;
    background-color: transparent;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    margin-left: auto;
    stroke: var(--cck-storybook-color-font-contrast-3);
    
    &:hover {
        background-color: var(--cck-storybook-color-bg-body-inverse-alpha-5);
    }
`;

const StylesRow = styled.div`
    display: flex;
    justify-content: space-between;
`;

const StylesName = styled.div`
    font: var(--cck-storybook-text-md-regular);
    color: var(--cck-storybook-color-font-contrast-4);
`;