import { Meta, type StoryObj } from '@storybook/angular';

import descriptionMd from './svg-icon-description.md';
import { SvgIconListComponent } from '../../src/lib/story-svg-icons-list/svg-icon-list.component';

const meta: Meta = {
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
