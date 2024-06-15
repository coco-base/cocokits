import {
  ArgTypes, Canvas,
  Description, DocsContainer,
  DocsContext, DocsContextProps, DocsStory,
  HeaderMdx,
  Primary,
  Stories,
  Subtitle,
  Title,
} from '@storybook/addon-docs';
import React, { useContext } from 'react';

// import { DocCocoKitsThemeSwitcher } from '@coco-kits/storybook-theme-switcher';

import { useStyles } from './DocPage.style';
import { Toc } from '../toc/Toc';
import { storyNameToHash } from '../../utils/doc-page.utils';
import { Code } from '@storybook/components';
import {
  DocCckThemeSwitcher,
  DocCocoKitsThemeSwitcher, LOCALSTORAGE_STORYBOOK_THEME, STORYBOOK_THEME_CHANGED_EVENT_NAME,
  StorybookThemeChangedEvent,
} from '@coco-kits/storybook-theme-switcher';


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

          <DocCckThemeSwitcher />
          <DocCocoKitsThemeSwitcher/>
          <Subtitle />

          <div className={styles.docDescription}>
            <Description />
          </div>

          <hr className={styles.divider} />

          <DocsStory of={primaryStory.moduleExport} />
          <ArgTypes />
          <Stories includePrimary={false} />
        </div>

        <div className={styles.sidebarNav}>
          <Toc stories={stories}></Toc>
        </div>
      </div>
    </>
  );
};