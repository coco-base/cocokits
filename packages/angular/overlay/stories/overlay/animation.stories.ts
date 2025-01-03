import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

import { OverlayComponent } from '../../src/components/overlay/overlay.component';

export const Animation: StoryObj<OverlayComponent> = {
  name: 'Animation',
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the overlay component with opening and closing animations, showcasing smooth transitions that enhance the user experience through visually engaging interactions.',
      },
      source: {
        code: ``,
      },
    },
  },
  render: (args) => ({
    props: { ...args },
    template: `
        <story-animation></story-animation>
    `,
  }),
};
