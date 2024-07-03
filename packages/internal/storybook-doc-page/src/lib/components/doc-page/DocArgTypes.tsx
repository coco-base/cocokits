import _ from 'lodash';
import React, { useContext } from 'react';
import styled from 'styled-components';

import { ThemeUIComponentsConfig, UIComponentsName, UIComponentsPropName } from '@cocokits/theme-core';

import { DocMarkdown } from './DocMarkdown';
import { DocsPageContext } from '../doc-page-container/DocPageContainer';

interface DocArgTypesProps {
  uiComponentsConfig: ThemeUIComponentsConfig
}

export const DocArgTypes = ({uiComponentsConfig}: DocArgTypesProps) => {
  const { primaryStory, title } = useContext(DocsPageContext);
  const componentName = _.camelCase(title) as UIComponentsName;
  const uiComponentConfig = uiComponentsConfig[componentName]

  const argTypesList = Object.values(primaryStory.argTypes)
    .filter(argType => !argType.table?.disable ?? true)
    .map((argType) => {

      const themeUIComponentProps = uiComponentConfig[argType.name as UIComponentsPropName];

      return {
        name: argType.name,
        description: argType.description,
        category: argType.table?.category,
        defaultValue: themeUIComponentProps?.default ?? getValueWithoutSignal(argType.table?.defaultValue?.summary),
        type: themeUIComponentProps?.values ?? [getValueWithoutSignal(argType.table?.type?.summary)],
      };
    });

  if (argTypesList.length === 0) {
    return;
  }

  return (
    <StyledTable>
      <thead>
        <tr>
          <StyledTh>Name</StyledTh>
          <StyledTh>Type</StyledTh>
          <StyledTh>Description</StyledTh>
          <StyledTh>Default</StyledTh>
        </tr>
      </thead>
      <tbody>
        {argTypesList.map(argType => (
          <StyledTr key={argType.name}>

            <StyledTd>{argType.name}</StyledTd>

            <StyledTd>
              <StyledTypeWrapper>
                {
                  argType.type.map(type => <code>{type}</code>)
                }
              </StyledTypeWrapper>
            </StyledTd>

            <StyledTd>
              {argType.description && <DocMarkdown>{argType.description}</DocMarkdown>}
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
        white-space: nowrap;
        font: var(--cck-storybook-text-xs-regular);
        padding: var(--cck-storybook-size-0) var(--cck-storybook-size-6);
    }
`;
const StyledTh = styled.th`
    font: var(--cck-storybook-text-sm-medium);
    color: var(--cck-storybook-color-font-contrast-4);
    padding: var(--cck-storybook-size-12) var(--cck-storybook-size-24);
`;

const StyledTypeWrapper = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
`;
// endregion


// region ---------------- UTILS ----------------

/**
 * Quick fix: get the real default value from angular signal.
 * Example: `input<BaseColor | null>(BaseColor.Default)` -> `BaseColor.Default`
 * TODO: remove this quick fix, after compoDoc return the value of signal.
 */
function getValueWithoutSignal(value: string | undefined) {
  if (value?.startsWith('input<')) {
    const match = value.match(/\(([^)]+)\)/);
    if (match) {
      return match[1];
    }
  }

  if (value?.startsWith('InputSignal<')) {
    const match = value.match(/<([^)]+)>/);
    if (match) {
      return match[1];
    }
  }

  return value;
}
// endregion