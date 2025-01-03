import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { moduleMetadata, Preview } from '@storybook/angular';

import { Icons } from '@cocokits/storybook-addon-theme';

import { withWrapperDecorator } from './decorators';

export const PREVIEW_BASE: Preview = {
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
