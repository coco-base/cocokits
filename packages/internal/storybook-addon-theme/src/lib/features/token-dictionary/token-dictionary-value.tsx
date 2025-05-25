import styled, { css } from 'styled-components';

import { TokenType } from '@cocokits/core';

import { TokenDictionaryValueHierarchy } from './token-dictionary.model';
import { TokenColorIcon, TokenDimensionIcon, TokenEffectIcon, TokenTextIcon } from './token-dictionary-icons';

type TokenDictionaryValueProp = TokenDictionaryValueHierarchy & {
  compact?: boolean;
};

export function TokenDictionaryValue({
  type,
  text,
  collectionName,
  modeName,
  compact = false,
}: TokenDictionaryValueProp) {
  return (
    <StylesWrapper $hasGap={!!collectionName || !!modeName} $compact={compact}>
      <StyledValueWrapper>
        {getTokenIconType(type)}
        <StyledValue $compact={compact}>{text}</StyledValue>
      </StyledValueWrapper>

      <StyledGroupWrapper>
        {collectionName && (
          <StyledGroupRow>
            <StyledTitle>Collection:</StyledTitle>
            <StyledText>{collectionName}</StyledText>
          </StyledGroupRow>
        )}

        {modeName && (
          <StyledGroupRow>
            <StyledTitle>Mode:</StyledTitle>
            <StyledText>{modeName}</StyledText>
          </StyledGroupRow>
        )}
      </StyledGroupWrapper>
    </StylesWrapper>
  );
}

function getTokenIconType(type: TokenType) {
  switch (type) {
    case 'color':
      return <TokenColorIcon />;

    case 'dimension':
      return <TokenDimensionIcon />;

    case 'typography':
    case 'string':
      return <TokenTextIcon />;

    case 'shadow':
    default:
      return <TokenEffectIcon />;
  }
}

const StylesWrapper = styled.div<{ $hasGap: boolean; $compact: boolean }>`
  width: fit-content;
  display: flex;
  flex-direction: column;
  border-radius: 6px;

  ${(props) =>
    !props.$compact &&
    css`
      padding: 6px 12px;
      background-color: var(--cck-doc-color-bg-1);
      border: 1px solid var(--cck-doc-color-border-2);
    `}

  ${(props) =>
    props.$compact &&
    css`
      padding: 2px 12px;
    `}
    
    ${(props) =>
    props.$hasGap &&
    css`
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
  font: var(--cck-doc-text-xs-regular);
  color: var(--cck-doc-color-font-4);
`;

const StyledText = styled.div`
  font: var(--cck-doc-text-xs-medium);
  color: var(--cck-doc-color-font-2);
`;

const StyledValue = styled.div<{ $compact: boolean }>`
  font: var(--cck-doc-text-sm-medium);
  color: var(--cck-doc-color-font-1);

  ${(props) =>
    props.$compact &&
    css`
      color: var(--cck-doc-color-font-3);
    `}
`;
