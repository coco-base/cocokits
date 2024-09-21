import { AngularStoryObj } from '@cocokits/internal-model';

import { OverlayComponent } from '../../src/components/overlay/overlay.component';

export const ConnectToElement: AngularStoryObj<OverlayComponent> = {
  name: 'ConnectToElement',
  parameters: {
    docs: {
      description: {
        story:
          'Enables the overlay to be attached to a specific target element, allowing it to be positioned dynamically at various locations relative to the target, such as bottom-left.',
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
