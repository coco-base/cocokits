import { AngularStoryObj } from '@cocokits/internal-model';

import { OverlayComponent } from '../../src/components/overlay/overlay.component';

export const Animation: AngularStoryObj<OverlayComponent> = {
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
