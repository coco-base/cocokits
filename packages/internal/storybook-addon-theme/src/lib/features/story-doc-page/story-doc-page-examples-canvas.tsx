import { PreparedStory } from '@storybook/types';
import { useLayoutEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { IconButton } from '@cocokits/react-button';
import { SvgIcon } from '@cocokits/react-icon';

import { StoryDocPageExampleStoreCellStyle, useStoryDocPageExampleStore } from './story-doc-page-examples.store';
import { AddonParameters } from '../../model/addon.model';
import { Icons } from '../../utils/icons';
import { Story } from '../story-canvas/story';
import { StoryCanvasWrapper } from '../story-canvas/story-canvas-wrapper';
import { StorySourceCode } from '../story-source-code/story-source-code';

interface StoryDocPageExamplesCanvasProps {
  index: number;
  story: PreparedStory;
  isExpanded?: boolean;
  onExpandClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const ANIMATION_OPTION: KeyframeAnimationOptions = {
  easing: 'ease-out',
  fill: 'both',
};


export function StoryDocPageExamplesCanvas({ index, story, className }: StoryDocPageExamplesCanvasProps) {
  const [shouldShowSourceCode, setShouldShowSourceCode] = useState(false);

  const hostRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const sourceCodeRef = useRef<HTMLDivElement>(null);
  const expandButtonRef = useRef<HTMLButtonElement>(null);
  const collapseButtonRef = useRef<HTMLButtonElement>(null);

  const store = useStoryDocPageExampleStore();

  const parameters = story.parameters as AddonParameters;
  const title = story.name;
  const description = parameters.docs.description.story;

  useLayoutEffect(() => {
    if (
      !store ||
      !hostRef.current ||
      !titleRef.current ||
      !canvasContainerRef.current
    ) {
      return;
    }

    const subscription = store.getCellStyles$(index).subscribe((_styles) => {
      const styles = _styles as StoryDocPageExampleStoreCellStyle;
      const options: KeyframeAnimationOptions = {...ANIMATION_OPTION, duration: styles.expandedChanged ? 300 : 0};

      // Just one time, because generate the source code const and we don't want to regenerate it.
      if(styles.isExpanded){
        setShouldShowSourceCode(true);
      }

      Promise.all([
        hostRef.current?.animate(styles.host, options),
        titleRef.current?.animate(styles.title, options),
        descriptionRef.current?.animate(styles.description, options),
        canvasContainerRef.current?.animate(styles.canvasContainer, options),
        sourceCodeRef.current?.animate(styles.sourceCode, options),
        expandButtonRef.current?.animate(styles.expandButton, options),
        collapseButtonRef.current?.animate(styles.collapseButton, options),
      ]);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [
    store,
    index,
    hostRef.current,
    titleRef.current,
    canvasContainerRef.current,
    sourceCodeRef.current,
    expandButtonRef.current,
    collapseButtonRef.current,
  ]);

  const onCollapseClick = () => {
    store?.setCellExpanded(index, false);
  };

  const onExpandClick = () => {
    store?.setCellExpanded(index, true);
  };

  return (
    <StyledHost ref={hostRef} className={className}>
      <StyledTitle ref={titleRef}>{title}</StyledTitle>
      {description && <StyledDescription ref={descriptionRef}>{description}</StyledDescription>}

      <StyledStoryCanvasContainer ref={canvasContainerRef}>
        <StyledStoryCanvasWrapper>
          <Story story={story} />

          <StyledCodeButton ref={expandButtonRef} onClick={onExpandClick}>
            <SvgIcon icon={Icons.code} />
          </StyledCodeButton>

        </StyledStoryCanvasWrapper>
      </StyledStoryCanvasContainer>

      <StyledStorySourceCode ref={sourceCodeRef} story={story} pause={!shouldShowSourceCode}/>

      <StyledCloseButton ref={collapseButtonRef} onClick={onCollapseClick}>
        <SvgIcon icon={Icons.close} />
      </StyledCloseButton>
    </StyledHost>
  );
}

const StyledHost = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0; // Expanded 24px
`;

const StyledTitle = styled.div`
  font: var(--cck-doc-text-sm-medium); // Expanded var(--cck-doc-text-xl-medium)
  color: var(--cck-doc-color-font-1);
  transition: inherit;
  margin-bottom: 6px;
`;

const StyledDescription = styled.p`
  height: 0; // Expanded 24px
  opacity: 0; // Expanded 1
  margin-bottom: 0; // Expanded 16px
  overflow: hidden;
  text-overflow: ellipsis;
  transition: inherit;
  white-space: nowrap;
`;

const StyledStoryCanvasContainer = styled.div`
  // We can not add the border to the StoryCanvasWrapper directly because of subpixel rendering,
  // will make the border blurry and sime times it will be behind the background
  border: 1px solid var(--cck-doc-color-border-2);
  border-radius: var(--cck-doc-radius-md);
  transition: inherit;
  height: 250px; // Expanded 270px;
`;

const StyledStoryCanvasWrapper = styled(StoryCanvasWrapper)`
  padding: 24px;
  width: 100%;
  height: 100%;
  transition: inherit;
  position: relative;

  &:hover .doc-cck-icon-button {
    opacity: 1;
  }
`;

const StyledStorySourceCode = styled(StorySourceCode)`
  flex: 0; // Expanded: 1
  opacity: 1; // Expanded: 1
  min-height: 0;
  overflow: hidden;
  margin: 0; // Expanded 8px 0
`;

const StyledCloseButton = styled(IconButton)`
  position: absolute;
  top: 18px;
  right: 12px;
`;

const StyledCodeButton = styled(IconButton)`
  position: absolute;
  right: 4px;
  bottom: 4px;
  opacity: 0;
  transition: 100ms opacity;
`;
