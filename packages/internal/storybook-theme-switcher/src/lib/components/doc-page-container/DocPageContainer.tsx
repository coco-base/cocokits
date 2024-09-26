import { DocsContainer } from '@storybook/addon-docs';
import { DocsContextProps, PreparedStory } from '@storybook/types';
import React, { createContext, ReactNode } from 'react';

import { getDocPageContent } from './doc-page-context.util';
import { storybookThemeListener } from './storybook-theme-listener';


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

  const docPageContext = getDocPageContent(props.context);

  storybookThemeListener(props.context);

  // Stories DocPage
  if(docPageContext) {
    return (
      <DocsPageContext.Provider value={docPageContext}>
        <DocsContainer context={props.context}>{props.children}</DocsContainer>
      </DocsPageContext.Provider>
    );
  }

  // MDX DocPage
  return (
    <DocsContainer context={props.context}>{props.children}</DocsContainer>
  );


};
// endregion