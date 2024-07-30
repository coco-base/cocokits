import { API_HashEntry } from '@storybook/types';
import React from 'react';
import styled, { css } from 'styled-components';

export const StorybookSidenavLabel = (item: API_HashEntry) => {

  // To get item status from story tag
  // const tags = (item.type === 'story' || item.type === 'docs') ? item.tags as StorybookTags[] : [] as StorybookTags[];
  // const status = tags.find(tag => ['status:deprecated', 'status:beta'].includes(tag)) as CckStorybookSidenavItemStatus;

  const isCollapsable = item.type === 'root' || item.type === 'group' || item.type === 'component';
  const isSelectable = item.type === 'docs' || item.type === 'story';

  return (
    <StyledWrapper data-cck-storybook-sidenav-item root={item.depth === 0} deep={item.depth}>

      {
        isCollapsable &&
        <StyledArrowSvg viewBox="0 0 14 8" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M7 5.53585L12.2788 0.29285C12.6725 -0.0976155 13.3109 -0.0976164 13.7047 0.292849C14.0984 0.683314 14.0984 1.31638 13.7047 1.70685L7.71307 7.65674C7.31925 8.04727 6.68075 8.04727 6.28693 7.65674L0.295317 1.70685C-0.0984392 1.31638 -0.0984391 0.683314 0.295318 0.292849C0.689074 -0.0976165 1.32748 -0.0976162 1.72124 0.292849L7 5.53585Z"></path>
        </StyledArrowSvg>
      }

      { isSelectable && <StyledSelectedIcon />}

      <span>{item.name}</span>
    </StyledWrapper>
  );
};


// region ---------------- STYLES ----------------
const StyledWrapper = styled.div<{ root: boolean, deep: number }>`
    width: 100%;
    position: relative;
    display: flex;
    align-items: center;
    text-transform: none; // Override storybook parent styles
    letter-spacing: 0; // Override storybook parent styles

    margin: var(--cck-storybook-size-2) var(--cck-storybook-size-0);
    font: var(--cck-storybook-text-sm-regular);
    color: var(--cck-storybook-color-font-contrast-2);
    height: var(--cck-storybook-size-32);
    border-radius: var(--cck-storybook-size-8);
    transition: color 300ms, fill 300ms;

    // Deep 0 (Root)
    ${props => props.root && css`
        margin-top: var(--cck-storybook-size-12);
    `};
    
    // Deep 1
    ${props => props.root && css`
        font: var(--cck-storybook-text-sm-medium);
        color: var(--cck-storybook-color-font-contrast-4);
    `};

    // Deep 2
    ${props => props.deep === 1 && css`
        padding-left: var(--cck-storybook-size-16);
    `};

    // Deep 3
    ${props => props.deep === 2 && css`
        padding-left: calc(2 * var(--cck-storybook-size-16));
    `};

    // Deep 4
    ${props => props.deep === 3 && css`
        padding-left: calc(3 * var(--cck-storybook-size-16));
    `};
    
    
    [data-selected="true"] &,
    [data-selected="true"] &:hover {
        background-color: var(--cck-storybook-color-bg-body-inverse-alpha-3);
        color: var(--cck-storybook-color-font-contrast-4);
    }

    &:hover {
        color: var(--cck-storybook-color-font-contrast-4);
    }
`;

const StyledSelectedIcon = styled.span`
    width: var(--cck-storybook-size-8);
    height: var(--cck-storybook-size-8);
    border-radius: 50%;
    background-color: var(--cck-storybook-color-brand-default);
    transition: opacity 300ms;
    
    opacity: 0;
    margin-right: var(--cck-storybook-size-8);
    margin-left: calc(-1 * var(--cck-storybook-size-8));

    [data-selected="true"] & {
        opacity: 1;
    }
`;

const StyledArrowSvg = styled.svg`
    width: 10px;
    fill: currentColor;
    transform: rotateZ(-90deg);
    transition: transform 300ms;
    margin-right: 8px;

    [aria-expanded="true"] & {
        transform: rotateZ(0deg);
    }
`;
// endregion

