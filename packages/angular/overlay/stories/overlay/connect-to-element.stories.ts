import { AngularStoryObj } from '@cocokits/core';

import { OverlayComponent } from '../../src/components/overlay/overlay.component';

export const ConnectToElement: AngularStoryObj<OverlayComponent> = {
  name: 'ConnectToElement',
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
        <story-connect-to-element [panelClass]="['story-overlay-transparent-backdrop']"></story-connect-to-element>
    `,
  }),
};
