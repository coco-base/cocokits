import {
  ArgTypes,
  Description,
  DocsContext,
  HeaderMdx,
  Primary,
  Stories,
  Subtitle,
  Title,
} from '@storybook/addon-docs';
import React, { useContext } from 'react';

import { SelectThemeSwitcher } from '@coco-kits/storybook-theme-switcher';

import { useStyles } from './DocPage.style';
import { Toc } from './Toc';
import { storyNameToHash } from '../utils/doc-page.utils';


export const DocPage = () => {

  const styles = useStyles();
  const context = useContext(DocsContext);

  const stories = context.componentStories();
  const primaryStory = stories[0];

  return (
    <>
      <Title />
      <div className={styles.contentWrapper}>

        <div className={styles.docContent}>

          <SelectThemeSwitcher/>
          <Subtitle />

          <div className={styles.docDescription}>
            <Description />
          </div>

          <hr className={styles.divider} />

          <HeaderMdx as="h3" id={storyNameToHash(primaryStory.name)}>
            {primaryStory.name}
          </HeaderMdx>
          <Primary />
          <ArgTypes />
          <Stories includePrimary={false}/>
        </div>

        <div className={styles.sidebarNav}>
          <Toc stories={stories}></Toc>
        </div>
      </div>
    </>
  );
};