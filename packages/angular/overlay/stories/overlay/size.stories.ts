import { AngularStoryObj } from '@cocokits/internal-model';

import { OverlayComponent } from '../../src/components/overlay/overlay.component';

export const Size: AngularStoryObj<OverlayComponent> = {
  name: 'Size',
  parameters: {
    docs: {
      description: {
        story: `Opens an overlay with a fixed size or sets minimum and maximum sizes, allowing it to fit different design needs.`,
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
