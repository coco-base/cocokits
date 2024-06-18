import { DocsContextProps, PreparedStory } from '@storybook/types';

export const getContextCategory = (context: DocsContextProps): string => {
  const primaryStory = getContextPrimaryStory(context);
  const category = primaryStory.title.split('/')[0]; // Title Example: UI Components/
  return category;
};

export const getContextTitle = (context: DocsContextProps): string => {
  const primaryStory = getContextPrimaryStory(context);
  const title = primaryStory.title.split('/').at(-1); // Title Example: UI Components/
  return title ?? '';
};

export const getContextMetaDescription = (context: DocsContextProps): string => {
  const primaryStory = getContextPrimaryStory(context);
  const parameters = primaryStory.parameters as Record<string, any>;
  const metaDescription = parameters['docs']?.description?.component;
  return metaDescription ?? '';
};

export const getContextPrimaryStory = (context: DocsContextProps): PreparedStory => {
  const stories = context.componentStories();
  const primaryStory = stories[0];
  return primaryStory;
};

export const getContextStoriesWithoutPrimary = (context: DocsContextProps): PreparedStory[] => {
  const stories = context.componentStories();
  return stories.slice(1);
};

export const getContextStories = (context: DocsContextProps): PreparedStory[] => {
  return context.componentStories();
};
