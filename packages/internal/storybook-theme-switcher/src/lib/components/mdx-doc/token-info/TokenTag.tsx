import React from 'react';
import styled, { css } from 'styled-components';

import { TokenType } from '@cocokits/core';

import { TokenColorIcon, TokenDimensionIcon, TokenEffectIcon, TokenTextIcon } from './TokenIcons';
import { TokenValueHierarchy } from './TokenValues';

type TokenTagProp = TokenValueHierarchy & {
  compact?: boolean
}

export function TokenTag({ type, text, collectionName, modeName, compact = false }: TokenTagProp) {
  return (
    <StylesWrapper $hasGap={!!collectionName || !!modeName} $compact={compact}>

      <StyledValueWrapper>
        {getTokenIconType(type)}
        <StyledValue>{text}</StyledValue>
      </StyledValueWrapper>


      <StyledGroupWrapper>
        {
          collectionName &&
          <StyledGroupRow>
            <StyledTitle>Collection:</StyledTitle>
            <StyledText>{collectionName}</StyledText>
          </StyledGroupRow>
        }

        {
          modeName &&
          <StyledGroupRow>
            <StyledTitle>Mode:</StyledTitle>
            <StyledText>{modeName}</StyledText>
          </StyledGroupRow>
        }
      </StyledGroupWrapper>

    </StylesWrapper>
  );
}

function getTokenIconType(type: TokenType) {
  switch (type) {
    case 'color':
      return <TokenColorIcon/>;

    case 'dimension':
      return <TokenDimensionIcon/>;

    case 'typography':
    case 'string':
      return <TokenTextIcon/>;

    case 'shadow':
    default:
      return <TokenEffectIcon/>;
  }
}

const StylesWrapper = styled.div<{$hasGap: boolean, $compact: boolean}>`
    width: fit-content;
    display: flex;
    flex-direction: column;

    background-color: var(--cck-storybook-color-bg-body-inverse-alpha-2);
    border: 1px solid var(--cck-storybook-color-border-alpha-default);
    padding: 6px 12px;
    border-radius: 6px;

    ${props => props.$compact && css`
        padding: 2px 12px;
    `}
    
    ${props => props.$hasGap && css`
        gap: 12px;
    `}
`;


const StyledValueWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const StyledGroupWrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

const StyledGroupRow = styled.div`
    display: flex;
    gap: 4px;
`;


const StyledTitle = styled.div`
    font: var(--cck-storybook-text-xs-regular);
    color: var(--cck-storybook-color-font-contrast-2);
`;

const StyledText = styled.div`
    font: var(--cck-storybook-text-xs-medium);
    color: var(--cck-storybook-color-font-contrast-3);
`;

const StyledValue = styled.div`
    font: var(--cck-storybook-text-sm-medium);
    color: var(--cck-storybook-color-font-contrast-4);
`;