import { moduleMetadata } from '@storybook/angular';

import { AngularStoriesMeta, AngularStoryObj } from '@cocokits/core';
import { UIComponentConfig } from '@cocokits/core/angular';
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
          provide: UIComponentConfig,
          useFactory: () => getSelectedCckTheme()?.uiComponentConfig,
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
