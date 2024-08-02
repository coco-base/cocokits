import styled from 'styled-components';

import { Token, TokenMap, TokenModeName } from '@cocokits/workspace-plugin';

interface TokenValuePreviewProp {
  token: Token;
  tokenMap: TokenMap
}

export function TokenValuePreview({token, tokenMap}: TokenValuePreviewProp) {

  const getItemValues = (mode: TokenModeName) => {
    const tokenValues = token.modes[mode];

    if(tokenValues.aliasHierarchies && tokenValues.aliasHierarchies.length > 0) {
      const finalTokenValues = tokenValues.aliasHierarchies.flatMap(alias => {
        const lastAliasToke = alias.at(-1);
        if(!lastAliasToke) {
          return [];
        }
        const lastTokenValue = tokenMap[lastAliasToke.tokenId].modes[lastAliasToke.modeName];
        return [lastTokenValue.value];
      });

      return finalTokenValues;
    }

    return [tokenValues.value];
  };
  const itemsValue = Object.keys(token.modes).flatMap(mode => getItemValues(mode));
  const gridSize = Math.ceil(Math.sqrt(itemsValue.length));

  if(token.type === 'color') {
    return (
      <StylesWrapper gridSize={gridSize}>
        { itemsValue.map(bgColor => <StylesColorItem bg={bgColor}/>) }
      </StylesWrapper>
    );
  }

  if(token.type === 'dimension') {
    return (
      <StylesWrapper gridSize={gridSize}>
        { itemsValue.map(dimension => <StylesDimensionItem>{dimension}</StylesDimensionItem>) }
      </StylesWrapper>
    );
  }

  return;
}

const StylesWrapper = styled.div<{gridSize: number}>`
    width: 100px;
    display: grid;
    grid-template-columns: ${({ gridSize }) => `repeat(${gridSize}, 1fr)`};
    grid-template-rows: ${({ gridSize }) => `repeat(${gridSize}, 1fr)`};
    gap: 4px;
`;

const StylesColorItem = styled.div<{bg: string}>`
    aspect-ratio: 1 / 1;
    border-radius: 6px;
    background-color: ${({ bg }) => `${bg}`};
    border: 1px solid var(--cck-storybook-color-border-alpha-default);
`;

const StylesDimensionItem = styled.div`
    aspect-ratio: 1 / 1;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 6px;
    border: 1px solid var(--cck-storybook-color-border-alpha-default);
    font: var(--cck-storybook-text-xs-regular);
    color: var(--cck-storybook-color-font-contrast-4);
`;