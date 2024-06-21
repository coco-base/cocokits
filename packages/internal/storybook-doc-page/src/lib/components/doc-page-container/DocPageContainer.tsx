import { DocsContainer } from '@storybook/addon-docs';
import { DocsContextProps, PreparedStory } from '@storybook/types';
import { createContext, ReactNode } from 'react';

import {
  getContextCategory,
  getContextMetaDescription,
  getContextPrimaryStory, getContextStories, getContextStoriesWithoutPrimary,
  getContextTitle,
} from './doc-page-context.util';


// region ---------------- CONTEXT ----------------
export interface DocsPageContextProps {
  category: string;
  title: string;
  metaDescription: string;
  primaryStory: PreparedStory,
  storiesWithoutPrimary: PreparedStory[],
  stories: PreparedStory[]
}

export const DocsPageContext = createContext<DocsPageContextProps>({} as DocsPageContextProps);
// endregion


// region ---------------- CONTAINER ----------------
interface DocPageContainerProps {
  context: DocsContextProps;
  children: ReactNode;
}

export const DocPageContainer = (props: DocPageContainerProps) => {

  const docPageContext: DocsPageContextProps = {
    category: getContextCategory(props.context),
    title: getContextTitle(props.context),
    metaDescription: getContextMetaDescription(props.context),
    primaryStory: getContextPrimaryStory(props.context),
    storiesWithoutPrimary: getContextStoriesWithoutPrimary(props.context),
    stories: getContextStories(props.context)
  };

  return (
    <DocsPageContext.Provider value={docPageContext}>
      <DocsContainer context={props.context}>{props.children}</DocsContainer>
    </DocsPageContext.Provider>
  );
};
// endregion