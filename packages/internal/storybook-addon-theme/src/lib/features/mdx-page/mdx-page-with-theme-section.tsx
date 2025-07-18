import { Markdown } from '@storybook/blocks';
import { JSX } from 'react';

import { ThemeChangeEvent } from '../../model/event.model';
import { useTheme } from '../../utils/use-preview-theme';

export const MdxPageWithThemeSection = ({
  fn,
}: {
  fn: (theme: ThemeChangeEvent) => string | JSX.Element | (string | JSX.Element)[];
}) => {
  const theme = useTheme();

  const children = fn(theme);

  if (typeof children === 'string') {
    return <Markdown>{children.trim()}</Markdown>;
  }

  if (Array.isArray(children)) {
    return children.map((child, index) => {
      if (typeof child === 'string') {
        return <Markdown key={index}>{child.trim()}</Markdown>;
      }

      return child;
    });
  }

  return children;
};
