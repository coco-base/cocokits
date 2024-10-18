import { AngularStoryObj } from '@cocokits/internal-model';

import { OverlayComponent } from '../../src/components/overlay/overlay.component';

export const NoBackdrop: AngularStoryObj<OverlayComponent> = {
  name: 'NoBackdrop',
  parameters: {
    docs: {
      description: {
        story:
          'Shows the overlay component without a backdrop, allowing the underlying content to remain fully visible. Ideal for use cases like menus or other overlays where transparency is needed.',
      },
      source: {
        code: ``,
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
