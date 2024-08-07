import { AngularStoryObj } from '@cocokits/core';

import { OverlayComponent } from '../../src/components/overlay/overlay.component';

export const NoBackdrop: AngularStoryObj<OverlayComponent> = {
  name: 'NoBackdrop',
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
    props: {
      ...args,
      config: {
        hasBackdrop: false,
      },
    },
    template: `
        <story-basic [overlayConfig]="config"></story-basic>
    `,
  }),
};
