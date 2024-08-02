import { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';

import {
  AliasHierarchy,
  Token,
  TokenCollectionName,
  TokenId,
  TokenMap,
  TokenModeName,
  TokenType,
} from '@cocokits/workspace-plugin';

import { TokenArrowDownIcon, TokenArrowHeadLeftIcon, TokenArrowHeadRightIcon } from './TokenIcons';
import { TokenTag } from './TokenTag';

interface TokenValuesProp {
  token: Token,
  tokenMap: TokenMap
}

export interface TokenValueHierarchy {
  tokenId: TokenId;
  type: TokenType;
  collectionName?: TokenCollectionName;
  modeName?: TokenModeName;
  text: string;
}

function toTokenValueHierarchy(aliasHierarchy: AliasHierarchy): TokenValueHierarchy {
  return {
    tokenId: aliasHierarchy.tokenId,
    type: aliasHierarchy.type,
    collectionName: aliasHierarchy.collectionName,
    modeName: aliasHierarchy.modeName,
    text: aliasHierarchy.namePath.join(' / ')
  };
}

export function TokenValues({ token, tokenMap }: TokenValuesProp) {

  const [selectedIndex, setSelectedIndex] = useState(0);
  const hierarchies: TokenValueHierarchy[][] = Object.entries(token.modes)
    .flatMap(([modeName, tokenValue]) => {
      if(tokenValue.aliasHierarchies) {
        return tokenValue.aliasHierarchies.map(aliasHierarchy => {
          const lastAliasHierarchyToken = aliasHierarchy[aliasHierarchy.length - 1];
          const lastAliasToken = tokenMap[lastAliasHierarchyToken.tokenId];
          return [
            {
              tokenId: token.id,
              type: token.type,
              modeName,
              text: token.namePath.join(' / ')
            },
            ...aliasHierarchy.map(toTokenValueHierarchy),
            {
              tokenId: lastAliasHierarchyToken.tokenId,
              type: lastAliasHierarchyToken.type,
              text: lastAliasToken.modes[lastAliasHierarchyToken.modeName].value
            }
          ];
        });
      }

      return [
        [
          {
            tokenId: token.id,
            type: token.type,
            modeName,
            text: token.namePath.join(' / ')
          },
          {
            tokenId: token.id,
            type: token.type,
            text: tokenValue.value
          }]
      ];
    });

  useEffect(() => {
    setSelectedIndex(0);
  }, [token]);


  const maxIndex = hierarchies.length - 1;
  const minIndex = 0;

  return (
    <StylesContainer>
      <StylesWrapper selectedIndex={selectedIndex}>
        {
          hierarchies.map((hierarchy) => (
            <StylesHierarchyWrapper>
              {
                hierarchy.map((h, index) => (
                  <>
                    <TokenTag {...h}></TokenTag>
                    {
                      (index !== (hierarchy.length - 1)) &&
                      <TokenArrowDownIcon/>
                    }
                  </>
                ))
              }
            </StylesHierarchyWrapper>
          ))
        }
      </StylesWrapper>

      {/* Left Icon */}
      {
        selectedIndex > minIndex &&
        <StylesButton
          position="left"
          onClick={() => setSelectedIndex(Math.max(selectedIndex - 1, minIndex))}>
          <TokenArrowHeadLeftIcon/>
        </StylesButton>
      }

      {/* Right Icon */}
      {
        selectedIndex < maxIndex &&
        <StylesButton
          position="right"
          onClick={() => setSelectedIndex(Math.min(selectedIndex + 1, maxIndex))}>
          <TokenArrowHeadRightIcon/>
        </StylesButton>
      }

    </StylesContainer>
  );
}

const StylesContainer = styled.div`
    display: flex;
    overflow: hidden;
    position: relative;
`;

const StylesButton = styled.div<{ position: 'left' | 'right' }>`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    position: absolute;
    border: 1px solid var(--cck-storybook-color-border-alpha-default);
    top: 50%;
    transform: translateY(-50%);
    z-index: 1;
    cursor: pointer;
    
    &:hover {
        background-color: var(--cck-storybook-color-border-alpha-2);
    }

    ${props => props.position === 'left' && css`
        left: 0px;
    `}

    ${props => props.position === 'right' && css`
        right: 0px;
    `}
`;

const StylesWrapper = styled.div<{ selectedIndex: number }>`
    width: 100%;
    display: flex;
    transition: transform 300ms;

    transform: ${({ selectedIndex }) => `translateX(-${selectedIndex}00%)`};;
`;

const StylesHierarchyWrapper = styled.div`
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 6px;
    margin: 12px;
    width: calc(100% - 24px);
    height: calc(100% - 24px);
`;