import React from 'react';
import styled from 'styled-components';

import { Token, TokenMap } from '@cocokits/core';

import { TokenSection } from './TokenSection';
import { TokenValuePreview } from './TokenValuePreview';
import { TokenValues } from './TokenValues';
import { hasTokenPreview } from './utils';

interface TokenInfoProp {
  token: Token;
  tokenMap: TokenMap;
}

export function TokenInfo({ token, tokenMap }: TokenInfoProp) {
  const hasPreview = hasTokenPreview(token);
  return (
    <StylesWrapper>

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
      <TokenSection title="Value Hirarchy">
        <TokenValues token={token} tokenMap={tokenMap}></TokenValues>
      </TokenSection>

      {/* CSS */}
      <TokenSection title="CSS Varibale">
        <code>{token.variable.css}</code>
      </TokenSection>

      {/* SCSS */}
      <TokenSection title="SCSS Varibale">
        <code>{token.variable.scss}</code>
      </TokenSection>

    </StylesWrapper>
  );
}

const StylesWrapper = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 32px;
    background-color: var(--cck-storybook-color-bg-body-inverse-alpha-2);
    border: 1px solid var(--cck-storybook-color-border-alpha-default);
    padding: 24px 18px;
    border-radius: 6px;

    & code {
        align-self: baseline;
        font: var(--cck-storybook-text-sm-regular);
        padding: var(--cck-storybook-size-2) var(--cck-storybook-size-6);
        color: var(--cck-storybook-color-font-contrast-4);
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