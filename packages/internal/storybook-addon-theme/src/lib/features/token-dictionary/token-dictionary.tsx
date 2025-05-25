import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import { getInstance, recordReduceMerge } from '@cocokits/common-utils';
import { TokenId } from '@cocokits/core';
import { Tab, Tabs, TabSelectionChangeEvent } from '@cocokits/react-tabs';

import { getTokenList } from './token-dictionary.utils';
import { TokenDictionaryValue } from './token-dictionary-value';
import { GlobalEvent } from '../../data-access/global-event/preview-global-event';
import { useTheme } from '../../utils/use-preview-theme';

export function TokenDictionary() {
  const globalEvent = getInstance(GlobalEvent);
  const theme = useTheme();
  const tokenDictionary = theme.tokenDictionary;

  const [selectedCollection, setSelectedCollection] = useState<string>(tokenDictionary.collectionNames[0].name);
  const [selectedTokenId, setSelectedTokenId] = useState<TokenId | null>(null);

  useEffect(() => {
    const subscription = globalEvent.closeTokenInfo$.subscribe(() => {
      setSelectedTokenId(null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const modes = tokenDictionary.collectionModeNames[selectedCollection].map((mode) => mode.name);

  const tokensMaps = useMemo(() => {
    return recordReduceMerge(tokenDictionary.collectionGroupHierarchy, (groupOrTokenIds, collectionName) => {
      return { [collectionName]: getTokenList(groupOrTokenIds, tokenDictionary) };
    });
  }, [theme.id]);

  const onCollectionTabClick = (event: TabSelectionChangeEvent) => {
    setSelectedCollection(event.value);
  };

  const onTokenClick = (tokenId: TokenId) => {
    globalEvent.dispatch.changeTokenInfo(tokenId);
    setSelectedTokenId(tokenId);
  };

  return (
    <Tabs selectedValue={selectedCollection} onSelectionChange={onCollectionTabClick}>
      {tokenDictionary.collectionNames.map((collection) => (
        <Tab key={collection.rawName} label={collection.name} value={collection.name}>
          <StyledTable>
            <thead>
              <tr className="header">
                <th>Name</th>
                {modes.map((mode) => (
                  <th key={mode}>{mode}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {tokensMaps[selectedCollection].map((tokenOrGroupName) => {
                if (typeof tokenOrGroupName === 'string') {
                  return (
                    <tr key={tokenOrGroupName} className="group">
                      <td colSpan={modes.length + 1}>{tokenOrGroupName}</td>
                    </tr>
                  );
                }

                return (
                  <tr
                    key={tokenOrGroupName.id}
                    className={selectedTokenId === tokenOrGroupName.id ? 'selected' : ''}
                    onClick={() => onTokenClick(tokenOrGroupName.id)}>
                    <td>
                      <StyledTableName>{tokenOrGroupName.namePath.at(-1)}</StyledTableName>
                    </td>
                    {modes.map((mode) => {
                      const aliasTokenId = tokenOrGroupName.modes[mode].aliasTokenId;
                      if (aliasTokenId) {
                        const aliasToken = tokenDictionary.tokenMap[aliasTokenId];
                        return (
                          <td key={aliasToken.id}>
                            <TokenDictionaryValue
                              tokenId={aliasToken.id}
                              type={aliasToken.type}
                              text={aliasToken.namePath.join(' / ')}
                              compact={true}
                            />
                          </td>
                        );
                      }

                      return (
                        <td key={tokenOrGroupName.id}>
                          <TokenDictionaryValue
                            tokenId={tokenOrGroupName.id}
                            type={tokenOrGroupName.type}
                            text={tokenOrGroupName.modes[mode].value}
                            compact={true}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </StyledTable>
        </Tab>
      ))}
    </Tabs>
  );
}

const StyledTable = styled.table`
  border: none;
  border-spacing: 0;
  margin-top: 32px;
  width: 100%;

  & th {
    font: var(--cck-doc-text-sm-regular);
    color: var(--cck-doc-color-font-1);
    border: 1px solid var(--cck-doc-color-border-2);
    border-left-width: 0;
    height: 40px;
    padding: 0 16px;
    text-align: left;
  }

  & tr:not(.group):not(.header) {
    cursor: pointer;
  }

  & tr:not(.group):not(.selected):not(.header):hover {
    background-color: var(--cck-doc-color-bg-hover-1);
  }

  & tr.selected {
    background-color: var(--cck-doc-color-bg-selected-1);
  }

  & th:first-of-type {
    border-left-width: 1px;
  }

  & tr.group td {
    font: var(--cck-doc-text-sm-semibold);
    color: var(--cck-doc-color-font-3);
    min-height: 40px;
    padding-top: 32px;
    padding-bottom: 12px;
    padding-left: 4px;
  }

  & tr.group + tr td {
    border-top-width: 1px;
  }

  & tr:not(.group) td {
    border: 1px solid var(--cck-doc-color-border-1);
    border-top-width: 0;
    border-left-width: 0;
    padding: 0 16px;
  }

  & tr:not(.group) td:first-of-type {
    border-left-width: 1px;
  }
`;

const StyledTableName = styled.div`
  display: flex;
  align-items: center;
  font: var(--cck-doc-text-sm-regular);
  color: var(--cck-doc-color-font-1);
  min-height: 40px;
`;
