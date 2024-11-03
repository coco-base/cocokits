import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../src/lib/button';
import { withUiComponentConfig } from '@cocokits/storybook-theme-switcher';

export { Default as Primary } from './default.stories';

const meta: Meta<typeof Button> = {
  component: Button,
  decorators: [withUiComponentConfig],
  title: 'Button',
  tags: ['autodocs'],
};
export default meta;
export type Story = StoryObj<typeof Button>;