// eslint-disable-next-line camelcase
import { API_HashEntry } from '@storybook/types';
import React from 'react';
import styled, { css } from 'styled-components';

import { CckStorybookSidenavItemStatus, StorybookTags } from '../../model/storybook-meta.model';

// eslint-disable-next-line camelcase
export const SidebarLabel = (item: API_HashEntry) => {
  // To get item status from story tag
  const tags = item.type === 'story' || item.type === 'docs' ? (item.tags as StorybookTags[]) : ([] as StorybookTags[]);
  const status = tags.find((tag) =>
    Object.values(CckStorybookSidenavItemStatus).includes(tag as CckStorybookSidenavItemStatus)
  );

  const isCollapsable = item.type === 'root' || item.type === 'group' || item.type === 'component';
  // const isSelectable = item.type === 'docs' || item.type === 'story';

  return (
    <StyledWrapper deep={item.depth} data-cck-storybook-sidenav-item>
      <span>{item.name}</span>
      {status && <StyledStatusNew>{status.split('status:')[1]}</StyledStatusNew>}

      {isCollapsable && (
        <StyledArrowSvg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 10L8 6L4 10" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </StyledArrowSvg>
      )}
    </StyledWrapper>
  );
};

// region ---------------- STYLES ----------------
const StyledWrapper = styled.div<{ deep: number }>`
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  text-transform: none; // Override storybook parent styles
  letter-spacing: 0; // Override storybook parent styles
  border-radius: 6px;

  font: var(--cck-doc-text-sm-medium);
  color: var(--cck-doc-color-font-3);
  height: 36px;
  transition:
    color 300ms,
    fill 300ms;
  padding: 4px 12px;
  margin: 2px 0;

  // Deep 0 (Root)
  // Deep 1
  ${(props) =>
    props.deep === 0 &&
    css`
      font: var(--cck-doc-text-sm-medium);
      color: var(--cck-doc-color-font-1);
    `}

  // Deep 2
    ${(props) =>
    props.deep === 1 &&
    css`
      /* padding-left: var(--cck-storybook-size-16); */
    `}

    // Deep 3
    ${(props) =>
    props.deep === 2 &&
    css`
      /* padding-left: calc(2 * var(--cck-storybook-size-16)); */
    `}

    // Deep 4
    ${(props) =>
    props.deep === 3 &&
    css`
      /* padding-left: calc(3 * var(--cck-storybook-size-16)); */
    `}
    
    
    [data-selected="true"] &,
    [data-selected="true"] &:hover {
    background-color: var(--cck-doc-color-bg-selected-1);
    color: var(--cck-doc-color-brand-default);
  }

  &:hover {
    background-color: var(--cck-doc-color-bg-3);
  }
`;

const StyledArrowSvg = styled.svg`
  width: 16px;
  height: 16px;
  transform: rotateZ(-180deg);
  transition: transform 300ms;
  margin-left: auto;
  fill: none;

  [aria-expanded='true'] & {
    transform: rotateZ(0deg);
  }

  path {
    stroke: currentColor;
  }
`;

const StyledStatusNew = styled.span`
  background-color: var(--cck-doc-color-bg-selected-1);
  margin-left: 8px;
  padding: 0px 8px;
  border-radius: 6px;
  font: var(--cck-doc-text-sm-medium);
  color: var(--cck-doc-color-brand-default);
`;
// endregion
