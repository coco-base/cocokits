import { type StoryObj } from '@storybook/angular';

import { AngularStoriesMeta } from '@cocokits/common-types';

import { SvgIconListComponent } from './component/svg-icon-list.component';
import descriptionMd from './svg-icon-description.md';

const meta: AngularStoriesMeta = {
  component: SvgIconListComponent,
  title: 'UI Components/SvgIconList',
  tags: ['autodocs'],
  decorators: [],
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
