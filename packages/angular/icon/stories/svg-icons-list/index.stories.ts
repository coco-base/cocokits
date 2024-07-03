import { moduleMetadata, type StoryObj } from '@storybook/angular';

import { AngularStoriesMeta } from '@cocokits/common-types';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';
import { UIComponentConfig } from '@cocokits/theme-core/angular';

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

export const Default: StoryObj<SvgIconListComponent> = {};
