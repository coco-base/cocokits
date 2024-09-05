import { AngularStoryObj } from '@cocokits/internal-model';

import { OverlayComponent } from '../../src/components/overlay/overlay.component';

export const Animation: AngularStoryObj<OverlayComponent> = {
  name: 'Animation',
  parameters: {
    docs: {
      description: {
        story: 'TODO: ...',
      },
      source: {
        code: `TODO: Add source code of story`,
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
