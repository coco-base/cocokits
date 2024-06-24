import React, { useContext, useEffect, useState } from 'react';
import styled, { css } from 'styled-components';

import { intersectionObserver$ } from '@cocokits/common-utils';

import { scrollToStoryById } from './doc-page.util';
import { DocsPageContext } from '../doc-page-container/DocPageContainer';

export const DocToc = () => {
  const { stories } = useContext(DocsPageContext);
  const [selected, setSelected] = useState('');

  useEffect(() => {

    const storiesElement = stories
      .flatMap<Element>(story => document.querySelector(`#${story.id}`) ?? []);

    const subscriber = intersectionObserver$(storiesElement, { threshold: [0.5] })
      .subscribe(event => {
        for (const { intersectionRatio, target } of event.entries) {
          if (intersectionRatio >= 0.5) {
            setSelected(target.id);
            return;
          }
        }
      });

    return () => subscriber.unsubscribe();
  }, []);

  return (
    <StyledContainer>
      <h5>On this page</h5>
      <StyledOl>
        {stories.map(story => (
          <StyledLi
            selected={story.id === selected} key={story.id}
            onClick={() => scrollToStoryById(story.id)}>
            {story.name}
          </StyledLi>
        ))}
      </StyledOl>
    </StyledContainer>
  );
};

// region ---------------- STYLES ----------------
const StyledContainer = styled.div`
    width: var();
    height: 100%;
    position: sticky;
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

const StyledLi = styled.li<{ selected: boolean }>`
    text-decoration-line: none;
    font: var(--cck-storybook-text-sm-regular);
    color: var(--cck-storybook-color-font-contrast-2);
    cursor: pointer;

    &:hover {
        color: var(--cck-storybook-color-font-contrast-4);
    }

    ${props => props.selected && css`
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