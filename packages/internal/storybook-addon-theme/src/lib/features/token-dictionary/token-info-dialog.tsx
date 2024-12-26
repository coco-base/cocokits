import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { getInstance } from '@cocokits/common-utils';
import { Token, TokenType } from '@cocokits/core';

import { TokenDictionaryValueHierarchy } from './token-dictionary.model';
import { getTokenDictionaryValueHierarchy } from './token-info.utils';
import { TokenInfoSection } from './token-info-section';
import { TokenInfoValueHierarchy } from './token-info-value-hierarchy';
import { TokenInfoValuePreview } from './token-info-value-preview';
import { TokenInfoVariable } from './token-info-variable';
import { GlobalEvent } from '../../data-access/global-event/manager-global-event';
import { useTheme } from '../../utils/use-manager-theme';

interface TokenInfoDialogState {
  token: Token;
  hierarchiesModes: TokenDictionaryValueHierarchy[][];
  hasPreview: boolean;
  tokenType: TokenType;
}

export function TokenInfoDialog() {
  const globalEvent = getInstance(GlobalEvent);
  const theme = useTheme();
  const [state, setState] = useState<TokenInfoDialogState | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  useEffect(() => {
    const subscription = globalEvent.changeTokenInfo$.subscribe((tokenId) => {
      setSelectedIndex(0);

      const newToken = theme.tokenDictionary.tokenMap[tokenId];
      if (!newToken) {
        setState(null);
        return;
      }

      setState({
        token: newToken,
        hierarchiesModes: getTokenDictionaryValueHierarchy(newToken, theme.tokenDictionary.tokenMap),
        hasPreview: newToken.type === 'color' || newToken.type === 'dimension',
        tokenType: newToken.type,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [theme.id]);

  if (!state) {
    return <p>No Token Founded</p>;
  }

  const { token, hierarchiesModes, hasPreview, tokenType } = state;

  const onSelectedIndexChange = (_index: number) => {
    const index = Math.max(0, Math.min(hierarchiesModes.length - 1, _index));
    setSelectedIndex(index);
  };

  return (
    <StyledHost>
      <StyledNameSection title="Name">
        <StylesName>{token.namePath.join(' / ')}</StylesName>
      </StyledNameSection>

      {hasPreview && (
        <StyledPreviewSection title="Preview">
          <TokenInfoValuePreview
            hierarchiesModes={hierarchiesModes}
            tokenType={tokenType}
            selectedIndex={selectedIndex}
            onPreviewClick={onSelectedIndexChange}
          />
        </StyledPreviewSection>
      )}

      <StyledValueHierarchySection title="Value Hierarchy">
        <TokenInfoValueHierarchy
          hierarchiesModes={hierarchiesModes}
          selectedIndex={selectedIndex}
          onPrevClick={() => onSelectedIndexChange(selectedIndex - 1)}
          onNextClick={() => onSelectedIndexChange(selectedIndex + 1)}
        />
      </StyledValueHierarchySection>

      <StyledCssVariableSection title="Css Variable">
        <TokenInfoVariable value={token.variable.css} />
      </StyledCssVariableSection>

      <StyledScssVariableSection title="Scss Variable">
        <TokenInfoVariable value={token.variable.scss} />
      </StyledScssVariableSection>
    </StyledHost>
  );
}

const StyledHost = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 28px;
`;

const StyledNameSection = styled(TokenInfoSection)`
  grid-row: 1;
  grid-column: 1;
`;

const StyledPreviewSection = styled(TokenInfoSection)`
  width: 100px;
  grid-row: 1;
  grid-column: 2;
`;

const StyledValueHierarchySection = styled(TokenInfoSection)`
  grid-row: 2;
  grid-column: 1 / -1;
`;

const StyledCssVariableSection = styled(TokenInfoSection)`
  grid-row: 3;
  grid-column: 1 / -1;
`;

const StyledScssVariableSection = styled(TokenInfoSection)`
  grid-row: 4;
  grid-column: 1 / -1;
`;

const StylesName = styled.div`
  font: var(--cck-doc-text-md-regular);
  color: var(--cck-doc-color-font-1);
`;
