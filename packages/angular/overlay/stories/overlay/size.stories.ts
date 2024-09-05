import { AngularStoryObj } from '@cocokits/internal-model';

import { OverlayComponent } from '../../src/components/overlay/overlay.component';

export const Size: AngularStoryObj<OverlayComponent> = {
  name: 'Size',
  parameters: {
    docs: {
      description: {
        story: 'TODO: Add story description',
      },
      source: {
        code: `TODO: Add source code of story`,
      },
    },
  },
  render: (args) => ({
    props: { ...args },
    template: `
        <story-size></story-size>
    `,
  }),
};
