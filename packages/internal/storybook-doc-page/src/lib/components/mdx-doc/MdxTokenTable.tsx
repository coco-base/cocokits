import { useMemo, useState } from 'react';
import styled, { css } from 'styled-components';

import { recordForEach } from '@cocokits/common-utils';
import { useDocSelectedCckTheme } from '@cocokits/storybook-theme-switcher';
import { GroupOrTokenIds, Token, TokenId } from '@cocokits/workspace-plugin';

import { TokenInfo } from './token-info/TokenInfo';
import { TokenTag } from './token-info/TokenTag';

export function MdxTokenTable() {
  const selectedCckTheme = useDocSelectedCckTheme();
  if (!selectedCckTheme) {
    return;
  }

  const tokenDictionary = selectedCckTheme.tokenDictionary;

  const [selectedCollection, setSelectedCollection] = useState<string>(tokenDictionary.collectionNames[0].name);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);

  // Reset state when the theme changes.
  //
  // Changing the theme can leave the component with outdated state,
  // potentially leading to errors since the old state might not be
  // valid for the new theme. Resetting the state ensures compatibility
  // and proper functionality with the selected theme.
  const selectedCollectionValid = tokenDictionary.collectionNames.some(collection => collection.name === selectedCollection);
  if(!selectedCollectionValid) {
    setSelectedCollection(tokenDictionary.collectionNames[0].name);
    setSelectedToken(null);
    return;
  }

  const modes = tokenDictionary.collectionModeNames[selectedCollection].map(mode => mode.name);

  const getTokenList = (groupOrTokenIds: GroupOrTokenIds, groupNames = '') => {
    const result: (Token | string)[] = [];

    recordForEach(groupOrTokenIds, (childGroupOrTokenIds, groupOrTokenIdsKey) => {

      if(Array.isArray(childGroupOrTokenIds)) {
        // A collection can have token without any group. So token generators create an empty group fo them.
        // But we don't need to show the empty group in ui
        groupOrTokenIdsKey.startsWith('__')
          ? result.push('')
          : result.push(groupNames + groupOrTokenIdsKey);

        childGroupOrTokenIds.forEach((tokenId: TokenId) => {
          result.push(tokenDictionary.tokenMap[tokenId]);
        });
      } else {
        const currentGroupNames = groupOrTokenIdsKey.startsWith("__")
          ? groupNames + '/'
          : groupNames + groupOrTokenIdsKey + '/';
        console.log('groupOrTokenIdsKey', groupOrTokenIdsKey, currentGroupNames);
        result.push(...getTokenList(childGroupOrTokenIds, currentGroupNames));
      }
    });

    return result;
  };

  const tokenList = useMemo(() => {
    return getTokenList(tokenDictionary.collectionGroupHierarchy[selectedCollection]);
  }, [tokenDictionary.collectionGroupHierarchy, selectedCollection]);


  return (
    <StyledWrapper>
      <StyledTokensWrapper>
        <StyledCollectionWrapper>
          {
            tokenDictionary.collectionNames.map(collectionName =>
              <StyledCollection
                selected={selectedCollection === collectionName.name}
                onClick={() => setSelectedCollection(collectionName.name)}>
                <span>{collectionName.name}</span>
              </StyledCollection>
            )
          }
        </StyledCollectionWrapper>

        <StyledTable>
          <thead>
            <tr className='header'>
              <th>Name</th>
              { modes.map(mode => <th>{mode}</th>) }
            </tr>
          </thead>

          <tbody>
            {
              tokenList.map(tokenOrGroupName => {
                if(typeof tokenOrGroupName === 'string') {
                  return (
                    <tr className='group'>
                      <td colSpan={modes.length  +1}>{tokenOrGroupName}</td>
                    </tr>
                  );
                }

                return (
                  <tr className={selectedToken?.id === tokenOrGroupName.id ? 'selected' : ''} onClick={() => setSelectedToken(tokenDictionary.tokenMap[tokenOrGroupName.id])}>
                    <td><StyledTableName>{tokenOrGroupName.namePath.at(-1)}</StyledTableName></td>
                    {
                      modes.map(mode => {
                        const aliasTokenId = tokenOrGroupName.modes[mode].aliasTokenId;
                        if(aliasTokenId) {
                          const aliasToken = tokenDictionary.tokenMap[aliasTokenId];
                          return (
                            <td>
                              <TokenTag tokenId={aliasToken.id} type={aliasToken.type} text={aliasToken.namePath.join(' / ')} compact={true}/>
                            </td>
                          );
                        }

                        return (
                          <td>
                            <TokenTag tokenId={tokenOrGroupName.id} type={tokenOrGroupName.type} text={tokenOrGroupName.modes[mode].value} compact={true}/>
                          </td>
                        );
                      })
                    }
                  </tr>
                );
              })
            }
          </tbody>
        </StyledTable>

      </StyledTokensWrapper>

      {
        selectedToken &&
        <StyledTokenInfoWrapper>
          <TokenInfo token={selectedToken} tokenMap={tokenDictionary.tokenMap}/>
        </StyledTokenInfoWrapper>
      }
    </StyledWrapper>
  );
}

// region ---------------- STYLES ----------------
const StyledWrapper = styled.div`
    display: flex;
    gap: 24px;
`;

const StyledTokensWrapper = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: auto;
`;

const StyledCollectionWrapper = styled.div`
    display: flex;
    gap: 12px;
`;

const StyledCollection = styled.div<{selected: boolean}>`
    display: flex;
    justify-content: center;
    align-items: center;
    font: var(--cck-storybook-text-sm-medium);
    color: var(--cck-storybook-color-font-contrast-4);
    border: 1px solid var(--cck-storybook-color-border-alpha-2);
    border-radius: 500px;
    padding: 4px 20px;
    background-color: var(--cck-storybook-color-bg-body-inverse-alpha-2);
    cursor: pointer;
    white-space: nowrap;
    text-overflow: ellipsis;

    ${props => props.selected && css`
        background-color: var(--cck-storybook-color-brand-alpha-6);
        border: 1px solid var(--cck-storybook-color-brand-default);
    `}
`;

const StyledTokenInfoWrapper = styled.div`
    width: 400px;
    flex-shrink: 0;
    align-self: baseline;
    position: sticky;
    top: 80px;
`;

const StyledTable = styled.table`
    border: none;
    border-spacing: 0;
    margin-top: 32px;
    
    & th {
        font: var(--cck-storybook-text-sm-regular);
        color: var(--cck-storybook-color-font-contrast-4);
        border: 1px solid var(--cck-storybook-color-border-alpha-default);
        border-left-width: 0;
        height: 40px;
        padding: 0 16px;
        text-align: left;
    }
    
    & tr:not(.group):not(.header) {
        cursor: pointer;
    }

    & tr:not(.group):not(.selected):not(.header):hover {
        background-color: var(--cck-storybook-color-brand-alpha-3);
    }
    
    & tr.selected {
        background-color: var(--cck-storybook-color-brand-alpha-5);
    }

    & th:first-of-type {
        border-left-width: 1px;
    }
    
    & tr.group td {
        font: var(--cck-storybook-text-sm-semibold);
        color: var(--cck-storybook-color-font-contrast-4);
        min-height: 40px;
        padding-top: 32px;
        padding-bottom: 12px;
    }

    & tr.group + tr td {
        border-top-width: 1px;
    }
    
    & tr:not(.group) td {
        border: 1px solid var(--cck-storybook-color-border-card-default);
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
    font: var(--cck-storybook-text-sm-regular);
    color: var(--cck-storybook-color-font-contrast-4);
    min-height: 40px;
`;
// endregion