import { moduleMetadata } from '@storybook/angular';

import { ThemeConfigToken } from '@cocokits/angular-core';
import { AngularStoriesMeta, AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { SvgIconListComponent } from './component/svg-icon-list.component';
import descriptionMd from './description.md';

const meta: AngularStoriesMeta = {
  component: SvgIconListComponent,
  title: 'UI Components/SvgIconList',
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      providers: [
        {
          provide: ThemeConfigToken,
          useFactory: () => getSelectedCckTheme()?.themeConfig,
        },
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd].join('\n'),
      },
    },
  },
};
export default meta;

export const Default: AngularStoryObj<SvgIconListComponent> = {};
