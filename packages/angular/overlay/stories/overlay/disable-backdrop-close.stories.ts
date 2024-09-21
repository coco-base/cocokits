import { AngularStoryObj } from '@cocokits/internal-model';

import { OverlayComponent } from '../../src/components/overlay/overlay.component';

export const DisableBackdropClose: AngularStoryObj<OverlayComponent> = {
  name: 'DisableBackdropClose',
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the overlay component configured to prevent closure when the backdrop is clicked, ensuring that the overlay can only be closed programmatically by invoking the close method.',
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
        disableBackdropClose: true,
      },
    },
    template: `
        <story-basic [overlayConfig]="config"></story-basic>
    `,
  }),
};
