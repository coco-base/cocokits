import { DocsContextProps, PreparedStory } from '@storybook/types';

import { DocsPageContextProps } from './DocPageContainer';

export function getDocPageContent(context: DocsContextProps): DocsPageContextProps | null {
  const stories = getContextStories(context);
  const primaryStory: PreparedStory = getContextPrimaryStory(stories);

  // MDX DocPage don't have any story
  if (!primaryStory) {
    return null;
  }

  const docPageContext: DocsPageContextProps = {
    category: getContextCategory(primaryStory),
    title: getContextTitle(primaryStory),
    metaDescription: getContextMetaDescription(primaryStory),
    primaryStory,
    storiesWithoutPrimary: getContextStoriesWithoutPrimary(stories),
    stories,
  };

  return docPageContext;
}

export const getContextCategory = (primaryStory: PreparedStory): string => {
  const category = primaryStory.title.split('/')[0]; // Title Example: UI Components/
  return category;
};

export const getContextTitle = (primaryStory: PreparedStory): string => {
  const title = primaryStory.title.split('/').at(-1); // Title Example: UI Components/
  return title ?? '';
};

export const getContextMetaDescription = (primaryStory: PreparedStory): string => {
  const parameters = primaryStory.parameters as Record<string, any>;
  const metaDescription = parameters['docs']?.description?.component;
  return metaDescription ?? '';
};

export const getContextPrimaryStory = (stories: PreparedStory[]): PreparedStory => {
  const primaryStory = stories[0];
  return primaryStory;
};

export const getContextStoriesWithoutPrimary = (stories: PreparedStory[]): PreparedStory[] => {
  return stories.slice(1);
};

export const getContextStories = (context: DocsContextProps): PreparedStory[] => {
  return context.componentStories();
};
