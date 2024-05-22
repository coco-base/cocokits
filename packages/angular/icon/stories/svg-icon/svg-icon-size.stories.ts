import type { StoryObj } from '@storybook/angular';

import { SvgIconComponent } from '../../src';

export const Default: StoryObj<SvgIconComponent> = {
  name: 'Default',
  parameters: {
    docs: {
      description: {
        story: 'TODO: Add size story description',
      },
    },
  },
  render: () => ({
    template: `
      <div style="border: 1px solid; height: 200px">
        Size story
      </div>
    `,
  }),
};
