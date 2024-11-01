import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../src/lib/button';

export { Primary } from './default.stories';

const meta: Meta<typeof Button> = {
  component: Button,
  title: 'Button',
  tags: ['autodocs'],
};
export default meta;
export type Story = StoryObj<typeof Button>;