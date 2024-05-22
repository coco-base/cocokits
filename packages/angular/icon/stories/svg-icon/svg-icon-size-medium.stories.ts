import type { StoryObj } from '@storybook/angular';

import { SvgIconComponent } from '../../src';

export const SizeMedium: StoryObj<SvgIconComponent> = {
  name: 'Size Medium',
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
        Size Medium story
      </div>
    `,
  }),
};
