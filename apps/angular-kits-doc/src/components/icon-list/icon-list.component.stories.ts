import { Meta, StoryObj } from '@storybook/angular';

import { IconListComponent } from './icon-list.component';

type StoryType = IconListComponent & Record<string, unknown>;

const meta: Meta<StoryType> = {
  title: 'icon',
  component: IconListComponent,
};

export default meta;
type Story = StoryObj<StoryType>;

export const Default: Story = {};
