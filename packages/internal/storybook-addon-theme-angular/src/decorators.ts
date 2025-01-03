import { Provider } from '@angular/core';

import { componentWrapperDecorator } from '@storybook/angular';

// eslint-disable-next-line @nx/enforce-module-boundaries
import { ThemeConfigToken } from '@cocokits/angular-core';
import { getInstance } from '@cocokits/common-utils';
import { ThemeEvent } from '@cocokits/storybook-addon-theme';

export const withThemeConfigProvider: () => Provider = () => ({
  provide: ThemeConfigToken,
  useFactory: () => getInstance(ThemeEvent).getCurrentTheme().themeConfig,
});

export function withWrapperDecorator(
  {
    direction = 'row',
    insideBox = false,
  }: {
    direction?: 'row' | 'column';
    insideBox?: boolean;
  } = {},
  styles: Partial<CSSStyleDeclaration> = {}
): any {
  const classNames = ['story-decorator-wrapper'];

  if (direction === 'row') {
    classNames.push(`story-decorator-wrapper__row`);
  }

  if (direction === 'column') {
    classNames.push(`story-decorator-wrapper__column`);
  }

  if (insideBox) {
    classNames.push(`story-decorator-wrapper__inside-box`);
  }

  document.body.style;

  const inlineStyles = Object.entries(styles).map(([key, value]) => `${key}: ${value}`);

  return componentWrapperDecorator(
    (story) => `<div style="${inlineStyles.join('; ')}" class="${classNames.join(' ')}">${story}</div>`
  );
}
