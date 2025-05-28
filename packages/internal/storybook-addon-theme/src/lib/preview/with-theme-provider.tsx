import { DocsContainer } from '@storybook/addon-docs';
import { DocsContextProps } from '@storybook/types';
import { ReactNode, useEffect } from 'react';

import { getInstance } from '@cocokits/common-utils';
import { ThemeConfigContext } from '@cocokits/react-core';

import { storybookAddonThemeConfig } from '../../theme/theme-config';
import { ColorModeEvent } from '../data-access/colo-mode-event/preview-color-mode-event';
import { ThemeEvent } from '../data-access/theme-event/preview-theme-event';
import { StoryControlStore } from '../features/story-control/preview-story-args.store';
import { DocumentStyle } from '../utils/document-styles';

interface DocPageContainerProps {
  context: DocsContextProps;
  children: ReactNode;
}

export const WithThemeProvider = (props: DocPageContainerProps) => {
  getInstance(ColorModeEvent);
  getInstance(ThemeEvent);
  getInstance(StoryControlStore);

  useEffect(() => {
    const handleResize = () => {
      getInstance(DocumentStyle).setBreakpoint(window.parent.innerWidth <= 600 ? 'mobile' : 'pc');
    };

    getInstance(DocumentStyle).setBreakpoint(window.parent.innerWidth <= 600 ? 'mobile' : 'pc');
    window.parent.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  return (
    <ThemeConfigContext.Provider value={storybookAddonThemeConfig}>
      <DocsContainer context={props.context}>{props.children}</DocsContainer>
    </ThemeConfigContext.Provider>
  );
};
