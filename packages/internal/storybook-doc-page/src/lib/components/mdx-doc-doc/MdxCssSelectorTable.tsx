import React from 'react';
import styled, { css } from 'styled-components';

import { useDocSelectedCckTheme } from '@cocokits/storybook-theme-switcher';
import {
  cssSelectorRender,
  cssSelectorVariantElement,
  layoutClassNamesConfig,
  UIComponentsName,
} from '@cocokits/theme-core';

import { DocMarkdown } from '../doc-page/DocMarkdown';

export function MdxCssSelectorTable({ componentName }: { componentName: UIComponentsName }) {

  const coreClassNames = layoutClassNamesConfig[componentName];
  const selectedCckTheme = useDocSelectedCckTheme();

  if (!selectedCckTheme) {
    return;
  }

  const themeComponentConfig = selectedCckTheme.uiComponentConfig[componentName];

  return (
    <>
      <StyledH2>Layout Elements</StyledH2>
      <p>Selectors in this group will always be added to the DOM element, regardless of the variant.</p>
      <p><strong>Render Condition:</strong> Selectors in this group will be added always to the DOM element, no patter
        of the variant.</p>

      <StyledTable>
        <thead>
          <tr>
            <StyledTh>Selector</StyledTh>
            <StyledTh>Description</StyledTh>
          </tr>
        </thead>
        <tbody>
          {
            Object.entries(coreClassNames.elements).map(([key, value]) => (
              <StyledTr key={key}>
                <StyledTd noWrap={true}>{value.selectors}</StyledTd>
                <StyledTd><DocMarkdown>{value.description}</DocMarkdown></StyledTd>
              </StyledTr>
            ))
          }
        </tbody>
      </StyledTable>


      <StyledH2>Variants</StyledH2>
      <p><strong>Render Condition:</strong> These selectors will be added to the DOM when the corresponding variant
        group is added to the component.</p>

      {
        Object.entries(themeComponentConfig).map(([key, config]) => {
          if (!config) {
            return;
          }

          const selectorRenderer = config.selectorRenderer ?? cssSelectorRender[config.name];

          return (
            <>
              <StyledH3>{key}</StyledH3>
              <p>Selectors in this group act as <code>{key}</code> variants and are applied to specific layout elements.
              </p>
              {config.description && <DocMarkdown>{config.description}</DocMarkdown>}

              <StyledTable>
                <thead>
                  <tr>
                    <StyledTh>Selector</StyledTh>
                    <StyledTh>Package</StyledTh>
                    <StyledTh>Element</StyledTh>
                  </tr>
                </thead>
                <tbody>
                  {
                    Object.values(config.values).map(value => (
                      <StyledTr key={key}>
                        <StyledTd noWrap={true}>{selectorRenderer(coreClassNames.prefix, value)}</StyledTd>
                        <StyledTd>{selectedCckTheme.name}</StyledTd>
                        <StyledTd noWrap={true}>{cssSelectorVariantElement[config.name]}</StyledTd>
                      </StyledTr>
                    ))
                  }
                </tbody>
              </StyledTable>
            </>
          );
        })
      }
    </>
  );
}

// region ----------------  ----------------
const StyledH2 = styled.h2`
    margin-top: var(--cck-storybook-size-48)
`;


const StyledH3 = styled.h3`
    margin-top: var(--cck-storybook-size-48)
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
        color: var(--cck-storybook-color-font-contrast-3);
    }

    & code {
        font: var(--cck-storybook-text-xs-regular);
        padding: var(--cck-storybook-size-2) var(--cck-storybook-size-6);
    }
    
    & p {
        margin: 0;
    }
`;
const StyledTh = styled.th`
    font: var(--cck-storybook-text-sm-medium);
    color: var(--cck-storybook-color-font-contrast-4);
    padding: var(--cck-storybook-size-12) var(--cck-storybook-size-24);
    text-align: left;
`;
// endregion