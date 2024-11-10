import { componentWrapperDecorator, moduleMetadata } from '@storybook/angular';

import { ThemeConfigToken } from '@cocokits/angular-core';
import { AngularStoriesMeta, AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { ChipListComponent } from '../../src/lib/chip-list/chip-list.component';

const meta: AngularStoriesMeta = {
  component: ChipListComponent,
  title: 'Dev/ChipList',
  tags: ['!autodocs'],
  decorators: [
    componentWrapperDecorator((story) => `<div class="flex gap-24">${story}</div>`),
    moduleMetadata({
      providers: [
        {
          provide: ThemeConfigToken,
          useFactory: () => getSelectedCckTheme()?.themeConfig,
        },
      ],
    }),
  ],
  argTypes: {
    type: { control: 'text' },
    color: { control: 'text' },
    size: { control: 'text' },
  },
};

export default meta;

export const Default: AngularStoryObj<ChipListComponent> = {
  args: {
    // color: 'brand',
  },
};
