import { DocsContext } from '@storybook/blocks';
import { useContext, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';

import { getInstance, ScrollLocker } from '@cocokits/common-utils';

import { useCreateStoryDocPageExampleStore } from './story-doc-page-examples.store';
import { StoryDocPageExamplesCanvas } from './story-doc-page-examples-canvas';
import { GlobalEvent } from '../../data-access/global-event/preview-global-event';
import { AddonParameters } from '../../model/addon.model';
import { useTheme } from '../../utils/use-preview-theme';

export function StoryDocPageExamples() {
  const { StoreProvider, store } = useCreateStoryDocPageExampleStore();
  const globalEvent = getInstance(GlobalEvent);
  const theme = useTheme();
  const hostRef = useRef<HTMLDivElement>(null);

  const context = useContext(DocsContext);
  const stories = context.componentStories();

  const filteredStories = useMemo(() => {
    const _filteredStories = stories.filter((story) => {
      const storyParameters = story.parameters as AddonParameters;
      const renderConditions = storyParameters.cckAddon.renderConditions ?? [];

      return renderConditions.every((conditionFn) =>
        conditionFn({
          docPageTab: 'Examples',
          theme: theme,
          themeComponentConfig: theme.themeConfig.components[storyParameters.cckAddon.componentName],
        })
      );
    });

    // Register New Story
    _filteredStories.forEach((story) => {
      globalEvent.dispatch.newStory(story);
    });

    return _filteredStories;
  }, [stories]);

  // Register Host Element
  useLayoutEffect(() => {
    if (hostRef.current) {
      store.registerHostElement(hostRef.current, filteredStories.length);
    }
  }, [filteredStories]);

  // Update Lock Scroll
  // Update Grid Height
  useEffect(() => {
    const expandedSubscription = store.isCellExpanded$().subscribe((isCellExpanded) => {
      isCellExpanded ? ScrollLocker.globalInstance().lock() : ScrollLocker.globalInstance().unlock();
    });

    const heightSubscription = store.getGridHeight$().subscribe((gridHeight) => {
      if (hostRef.current) {
        hostRef.current.style.height = `${gridHeight}px`;
      }
    });

    return () => {
      ScrollLocker.globalInstance().unlock();
      expandedSubscription.unsubscribe();
      heightSubscription.unsubscribe();
    };
  }, [hostRef.current]);

  return (
    <StoreProvider value={store}>
      <StyledHost ref={hostRef}>
        {filteredStories.map((story, index) => {
          return <StyledStoryDocPageExamplesCanvas key={story.id} index={index} story={story} />;
        })}

        {filteredStories.length === 0 && (
          <>
            <h2>Coming Soon</h2>
            <p>
              We are working hard to bring you more amazing and real use case examples for each component. Stay tuned!
            </p>
          </>
        )}
      </StyledHost>
    </StoreProvider>
  );
}

const StyledHost = styled.div`
  position: relative;
  min-height: 70vh;
`;

const StyledStoryDocPageExamplesCanvas = styled(StoryDocPageExamplesCanvas)`
  position: absolute;
`;
