import type { StoryObj } from '@storybook/angular';

import { SvgIconComponent } from '../../src';

export const Size: StoryObj<SvgIconComponent> = {
  render: () => ({
    template: `
      <story-svg-icon-list></story-svg-icon-list>
    `,
  }),
};
