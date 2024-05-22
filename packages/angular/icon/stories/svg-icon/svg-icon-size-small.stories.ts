import type { StoryObj } from '@storybook/angular';

import { SvgIconComponent } from '../../src';

export const SizeSmall: StoryObj<SvgIconComponent> = {
  name: 'Size Small',
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
        Size small story
      </div>
    `,
  }),
};
