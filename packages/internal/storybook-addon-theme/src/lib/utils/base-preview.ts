import { ThemeConfigToken } from '@cocokits/angular-core';
import { getInstance, isNotNullish } from '@cocokits/common-utils';
import { componentWrapperDecorator, moduleMetadata, Preview } from '@storybook/angular';
import { ThemeEvent } from '../data-access/theme-event/preview-theme-event';
import { Icons } from './icons';
import { Provider } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

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

export const BASE_ANGULAR_BUTTON_PREVIEW: Preview = {
  tags: ['autodocs'],
  decorators: [
    withWrapperDecorator(),
    moduleMetadata({
      imports: [FormsModule, ReactiveFormsModule, CommonModule, BrowserAnimationsModule],
      providers: [],
    }),
  ],
  argTypes: {
    cckControl: { control: 'object', table: { disable: true } },
    cckIcons: { control: 'object', table: { disable: true } },
  },
  args: {
    cckIcons: Icons,
  },
};
