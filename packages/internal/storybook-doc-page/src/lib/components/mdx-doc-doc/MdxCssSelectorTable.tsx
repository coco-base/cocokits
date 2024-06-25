import React from 'react';
import styled, { css } from 'styled-components';

import { cssSelectorsMap } from '../../../../../../themes/core/src/lib/css-selectors/css-selectors-map';
import { DocMarkdown } from '../doc-page/DocMarkdown';


export function MdxCssSelectorTable({ componentName }: { componentName: keyof typeof cssSelectorsMap}) {

  const componentMap = cssSelectorsMap[componentName];
  const toc = Object.keys(componentMap).filter(variantName => !variantName.startsWith('_'));

  return (
    <>
      {
        toc.length > 0 &&
        <>
          <h2>Table of Contents</h2>
          <ul>
            {toc.map((variantName) => {
              return (
                <li>
                  <StyledA href={'#' + componentName + '_' + variantName} target="_self">{variantName}</StyledA>
                </li>
              );
            })}
          </ul>

          <hr />
        </>
      }

      {Object.entries(componentMap).map(([variantName, variantMap]) => {
        return (
          <>
            { !variantName.startsWith('_') && <StyledH2 id={componentName + '_' + variantName}>{variantName}</StyledH2>}
            <StyledTable>
              <thead>
              <tr>
                <StyledTh>Selector</StyledTh>
                <StyledTh>Properties</StyledTh>
                <StyledTh>Description</StyledTh>
              </tr>
              </thead>
              <tbody>
              {Object.values(variantMap).map(({ selector, properties, description, renderCondition }) => {
                return (
                  <StyledTr key={selector}>

                    <StyledTd noWrap={true}>{selector}</StyledTd>

                    <StyledTd noWrap={true}>
                      <ul>
                        {/* eslint-disable-next-line max-nested-callbacks */}
                        {properties.map(property => {
                          return (
                            <li>
                              <code>{property}</code>
                            </li>
                          );
                        })}
                      </ul>
                    </StyledTd>
                    <StyledTd>
                      <DocMarkdown>{description}</DocMarkdown>
                      <DocMarkdown>**Render Condition:** {renderCondition}</DocMarkdown>
                    </StyledTd>
                  </StyledTr>
                );
              })}
              </tbody>
            </StyledTable>
          </>
        );
      })}

    </>
  );
}

const StyledA = styled.a`
    color: var(--cck-storybook-color-font-link);
`;

const StyledH2 = styled.h2`
    margin-top: var(--cck-storybook-size-48)
`;

const StyledH4 = styled.h4`
    margin-top: var(--cck-storybook-size-24)
`;

const StyledTable = styled.table`
    width: 100%;
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
const StyledTd = styled.td<{ noWrap?: boolean }>`
    font: var(--cck-storybook-text-sm-regular);
    color: var(--cck-storybook-color-font-contrast-2);
    padding: var(--cck-storybook-size-12) var(--cck-storybook-size-24);
    border-top: var(--cck-storybook-size-1) solid var(--cck-storybook-color-border-alpha-default);

    ${props => props.noWrap && css`
        white-space: nowrap;
    `}
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