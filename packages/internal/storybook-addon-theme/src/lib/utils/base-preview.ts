import { ThemeConfigToken } from '@cocokits/angular-core';
import { getInstance } from '@cocokits/common-utils';
import { componentWrapperDecorator, moduleMetadata, Preview } from '@storybook/angular';
import { ThemeEvent } from '../data-access/theme-event/preview-theme-event';
import { Icons } from './icons';
import { Provider } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

export const withThemeConfigProvider: () => Provider = () => ({
  provide: ThemeConfigToken,
  useFactory: () => getInstance(ThemeEvent).getCurrentTheme().themeConfig,
});

export const BASE_ANGULAR_BUTTON_PREVIEW: Preview = {
  tags: ['autodocs'],
  decorators: [
    componentWrapperDecorator((story) => `<div class="story-decorator-wrapper">${story}</div>`),
    moduleMetadata({
      imports: [FormsModule, ReactiveFormsModule],
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
