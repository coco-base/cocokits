import styled, { css } from 'styled-components';

import { scrollToStoryById } from './doc-page.util';
import { useExistingItems, useSelectedTocItem } from './DocToc.hooks';

export interface DocTocProps {
  items: {id: string, name: string}[]
}

export interface TopItem {
  id: string;
  name: string;
  element: Element;
}


export const DocToc = ({items}: DocTocProps) => {
  const existItems = useExistingItems(items);
  const selected = useSelectedTocItem(existItems);

  return (
    <StyledContainer>
      <h5>On this page</h5>
      <StyledOl>
        {existItems.map(item => (
          <StyledLi
            $selected={item.id === selected} key={item.id}
            onClick={() => scrollToStoryById(item.id)}>
            {item.name}
          </StyledLi>
        ))}
      </StyledOl>
    </StyledContainer>
  );
};

// region ---------------- STYLES ----------------
const StyledContainer = styled.div`
    overflow-y: auto;
    height: calc(100vh - var(--cck-storybook-size-80));
    position: sticky;
    flex-shrink: 0;
    top: var(--cck-storybook-size-80);
    margin-top: var(--cck-storybook-size-96);
    margin-left: var(--cck-storybook-size-64);
`;

const StyledOl = styled.ol`
    position: relative;
    list-style-type: none;
    margin-left: 0;
    margin-top: 0;
    padding-inline-start: var(--cck-storybook-size-20);

    &:before {
        content: "";
        position: absolute;
        left: 0;
        height: 100%;
        width: var(--cck-storybook-size-4);
        background-color: var(--cck-storybook-color-bg-body-inverse-alpha-4);
        border-radius: var(--cck-storybook-size-4);
    }
`;

const StyledLi = styled.li<{ $selected: boolean }>`
    text-decoration-line: none;
    font: var(--cck-storybook-text-sm-regular);
    color: var(--cck-storybook-color-font-contrast-2);
    cursor: pointer;

    &:hover {
        color: var(--cck-storybook-color-font-contrast-4);
    }

    ${props => props.$selected && css`
        position: relative;
        color: var(--cck-storybook-color-brand-default);

        &:after {
            content: '';
            position: absolute;
            left: calc(-1 * var(--cck-storybook-size-20));
            top: 0;
            bottom: 0;
            width: var(--cck-storybook-size-4);
            background-color: var(--cck-storybook-color-brand-default);
            border-radius: var(--cck-storybook-size-4);
        }
        &:hover {
            color: var(--cck-storybook-color-brand-default);
        }
    `},
`;
// endregion