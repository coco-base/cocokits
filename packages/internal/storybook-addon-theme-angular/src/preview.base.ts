import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { moduleMetadata, Preview } from '@storybook/angular';

import { Icons } from '@cocokits/common-icons';

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
    cckExampleArgs: { control: 'object', table: { disable: true } },
    cckExampleCssVariables: { control: 'text', table: { disable: true } },
    cckIcons: { control: 'object', table: { disable: true } },
  },
  args: {
    cckIcons: Icons,
  },
};
