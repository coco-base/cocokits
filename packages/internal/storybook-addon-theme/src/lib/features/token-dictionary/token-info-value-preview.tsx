import styled from 'styled-components';

import { TokenType } from '@cocokits/core';

import { TokenDictionaryValueHierarchy } from './token-dictionary.model';

interface TokenValuePreviewProp {
  hierarchiesModes: TokenDictionaryValueHierarchy[][];
  tokenType: TokenType;
  selectedIndex: number;
  onPreviewClick: (index: number) => void;
}

export function TokenInfoValuePreview({
  hierarchiesModes,
  tokenType,
  selectedIndex,
  onPreviewClick,
}: TokenValuePreviewProp) {
  const itemsValue = hierarchiesModes.map((hierarchiesItems) => hierarchiesItems[hierarchiesItems.length - 1].text);
  const gridSize = Math.ceil(Math.sqrt(itemsValue.length));
  const isColor = tokenType === 'color';

  return (
    <StylesHost $gridSize={gridSize}>
      {itemsValue.map((value, index) => (
        <StyledItemWrapper $selected={index === selectedIndex} key={index} onClick={() => onPreviewClick(index)}>
          <StyledItem style={isColor ? { backgroundColor: value } : {}}>{isColor ? '' : value}</StyledItem>
        </StyledItemWrapper>
      ))}
    </StylesHost>
  );
}

const StylesHost = styled.div<{ $gridSize: number }>`
  display: grid;
  grid-template-columns: ${({ $gridSize }) => `repeat(${$gridSize}, 1fr)`};
  grid-template-rows: ${({ $gridSize }) => `repeat(${$gridSize}, 1fr)`};
  gap: 4px;
`;

const StyledItemWrapper = styled.div<{ $selected: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  aspect-ratio: 1 / 1;
  border: 1px solid
    ${({ $selected }) => ($selected ? `var(--cck-doc-color-brand-default)` : 'var(--cck-doc-color-border-2)')};
  padding: 4px;
  border-radius: var(--cck-doc-radius-sm);
  font: var(--cck-doc-text-xs-regular);
  color: var(--cck-doc-color-font-1);
`;

const StyledItem = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  border-radius: var(--cck-doc-radius-xs);
  word-break: break-all;
  overflow: hidden;
`;
