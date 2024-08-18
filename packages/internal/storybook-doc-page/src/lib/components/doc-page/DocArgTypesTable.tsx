import React from 'react';
import styled from 'styled-components';

import { ThemeUIComponentPropValue } from '@cocokits/core';

import { DocMarkdown } from './DocMarkdown';

export interface DocArgTypesList {
  name: string;
  description: string | undefined;
  defaultValue?: ThemeUIComponentPropValue;
  type: ThemeUIComponentPropValue[] | (string | undefined)[];
}

interface DocArgTypesProps {
  argTypesList: DocArgTypesList[],
  hideDefault?: boolean,
  header?: string
}

export const DocArgTypesTable = ({argTypesList, hideDefault = false, header}: DocArgTypesProps) => {

  if (argTypesList.length === 0) {
    return;
  }

  return (
    <>
      { header && <StyledH4>{header}</StyledH4> }
      <StyledTable>
        <thead>
          <tr>
            <StyledTh>Name</StyledTh>
            <StyledTh>Type</StyledTh>
            <StyledTh>Description</StyledTh>
            { !hideDefault && <StyledTh>Default</StyledTh> }
          </tr>
        </thead>
        <tbody>
          {argTypesList.map(argType => (
            <StyledTr key={argType.name}>

              <StyledTd>{argType.name}</StyledTd>

              <StyledTd>
                <StyledTypeWrapper>
                  {
                    argType.type.map(type => <code>{type?.toString()}</code>)
                  }
                </StyledTypeWrapper>
              </StyledTd>

              <StyledTd>
                {argType.description && <DocMarkdown>{argType.description}</DocMarkdown>}
              </StyledTd>

              {
                !hideDefault &&
                <StyledTd>
                  {argType.defaultValue !== null && <code>{argType.defaultValue?.toString()}</code>}
                </StyledTd>
              }

            </StyledTr>
          ))}

        </tbody>
      </StyledTable>
    </>
  );
};

// region ---------------- STYLES ----------------
const StyledH4 = styled.h4`
  margin-top: 24px;
`;
const StyledTable = styled.table`
    min-width: 100%;
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