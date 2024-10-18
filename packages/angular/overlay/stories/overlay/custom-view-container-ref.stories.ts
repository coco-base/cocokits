import { AngularStoryObj } from '@cocokits/internal-model';

import { OverlayComponent } from '../../src/components/overlay/overlay.component';

export const CustomViewContainerRef: AngularStoryObj<OverlayComponent> = {
  name: 'CustomViewContainerRef',
  parameters: {
    docs: {
      description: {
        story:
          'The element will be render in your custom `viewContainerRef`. To make sure the overlay will be visible in your custom container, change the position of overlay to `absolute`',
      },
      source: {
        code: ``,
      },
    },
  },
  render: (args) => ({
    props: {
      ...args,
      config: {},
    },
    template: `
        <story-default [overlayConfig]="config" [customViewContainerRet]="true"></story-default>
    `,
  }),
};
