import React, { useContext } from 'react';
import styled from 'styled-components';

import { DocMarkdown } from './DocMarkdown';
import { DocsPageContext } from '../doc-page-container/DocPageContainer';

export const DocArgTypes = () => {
  const { primaryStory } = useContext(DocsPageContext);

  const argTypesList = Object.values(primaryStory.argTypes).map((argType) => {

    // Quick fix: get the real default value from angular signal.
    // Example: `input<BaseColor | null>(BaseColor.Default)` -> `BaseColor.Default`
    // TODO: remove this quick fix, after compoDoc return the value of signal.
    let defaultValue = argType.table?.defaultValue?.summary;
    if (defaultValue?.startsWith('input<')) {
      const match = defaultValue.match(/\(([^)]+)\)/);
      if(match) {
        defaultValue = match[1];
      }
    }

    return {
      name: argType.name,
      description: argType.description,
      category: argType.table?.category,
      defaultValue,
      type: argType.table?.type?.summary,
    };
  });

  if(argTypesList.length === 0) {
    return;
  }

  return (
    <StyledTable>
      <thead>
        <tr>
          <StyledTh>Name</StyledTh>
          <StyledTh>Description</StyledTh>
          <StyledTh>Default</StyledTh>
        </tr>
      </thead>
      <tbody>
        {argTypesList.map(argType => (
          <StyledTr key={argType.name}>

            <StyledTd>{argType.name}</StyledTd>

            <StyledTd>
              {argType.description && <DocMarkdown>{argType.description}</DocMarkdown>}
              {argType.type && <code>{argType.type}</code>}
            </StyledTd>
            <StyledTd>
              {argType.defaultValue && <code>{argType.defaultValue}</code>}
            </StyledTd>
          </StyledTr>
        ))}

      </tbody>
    </StyledTable>
  );
};

// region ---------------- STYLES ----------------
const StyledTable = styled.table`
    border: var(--cck-storybook-size-1) solid var(--cck-storybook-color-bg-body-inverse-alpha-5);
    border-radius: var(--cck-storybook-size-6);
    border-spacing: 0;
    
    & p {
        color: inherit;
        font: inherit;
    }
`;

const StyledTr = styled.tr`
    font: var(--cck-storybook-text-sm-medium);
    color: var(--cck-storybook-color-font-contrast-4);
    padding: var(--cck-storybook-size-12) var(--cck-storybook-size-24);
    
    &:nth-child(even) {
        background-color: var(--cck-storybook-color-bg-table-even);
    }
`;
const StyledTd = styled.td`
    font: var(--cck-storybook-text-sm-regular);
    color: var(--cck-storybook-color-font-contrast-2);
    padding: var(--cck-storybook-size-12) var(--cck-storybook-size-24);
    border-top: var(--cck-storybook-size-1) solid var(--cck-storybook-color-border-alpha-default);
    
    &:first-child {
        font: var(--cck-storybook-text-sm-medium);
        color: var(--cck-storybook-color-font-contrast-4);
    }

    & code {
        font: var(--cck-storybook-text-xs-regular);
        padding: var(--cck-storybook-size-2) var(--cck-storybook-size-6);
    }
`;
const StyledTh = styled.th`
    font: var(--cck-storybook-text-sm-medium);
    color: var(--cck-storybook-color-font-contrast-4);
    padding: var(--cck-storybook-size-12) var(--cck-storybook-size-24);
`;
// endregion