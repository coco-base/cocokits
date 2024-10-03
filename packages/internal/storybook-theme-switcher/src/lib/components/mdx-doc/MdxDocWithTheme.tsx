import { Markdown } from '@storybook/addon-docs';
import React from 'react';

import { CckThemeChangedEvent } from '../../config/cck-themes.model';
import { useDocSelectedCckTheme } from '../../hooks/useDocSelectedCckTheme';


export const MdxDocWithTheme = ({ fn }: { fn: (theme: CckThemeChangedEvent) => string | JSX.Element }) => {

  const cckTheme = useDocSelectedCckTheme();

  if (!cckTheme) {
    return;
  }

  const children = fn(cckTheme);

  if (typeof children === 'string') {
    return (
      <Markdown>
        {children.trim()}
      </Markdown>
    );
  }

  return children;
};