import { AngularStoryObj } from '@cocokits/internal-model';

import { OverlayComponent } from '../../src/components/overlay/overlay.component';

export const PanelClass: AngularStoryObj<OverlayComponent> = {
  name: 'PanelClass',
  parameters: {
    docs: {
      description: {
        story:
          'TODO: Add story description. (Opacity and transform is part of animation, so dont define them in your custom class)',
      },
      source: {
        code: `TODO: Add source code of story`,
      },
    },
  },
  render: (args) => ({
    props: {
      ...args,
      overlayConfig: {
        panelClass: ['story-overlay-red-backdrop'],
      },
    },
    template: `
        <story-basic [overlayConfig]="overlayConfig"></story-basic>
    `,
  }),
};
