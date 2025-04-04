import { moduleMetadata } from '@storybook/angular';

import { OverlayComponent } from '@cocokits/angular-overlay';
import { OverlayAnimationType } from '@cocokits/react-overlay';
import { AddonParametersControlType, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

import { ExampleOverlayDefaultComponent } from './example-overlay-default.component';

export const Default: StoryObj<OverlayComponent> = {
  name: 'Default',
  decorators: [
    moduleMetadata({
      imports: [ExampleOverlayDefaultComponent],
    }),
  ],
  parameters: {
    docs: {
      description: {
        story:
          'Shows the default example with no additional configurations, providing an interactive example in its most basic form.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Overview')],
      source: [],
      hasControl: true,
      controls: [
        {
          displayName: 'Animation Type',
          default: OverlayAnimationType.BottomToCenter,
          options: Object.values(OverlayAnimationType),
          storyArgKey: 'animationType',
          type: AddonParametersControlType.Select,
        },
        {
          displayName: 'Has Backdrop',
          default: false,
          storyArgKey: 'hasBackdrop',
          type: AddonParametersControlType.Boolean,
        },
        {
          displayName: 'Disable Backdrop Close',
          default: false,
          storyArgKey: 'disableBackdropClose',
          type: AddonParametersControlType.Boolean,
        },
      ],
    },
  },
  render: (args) => ({
    props: { ...args },
    template: `
      <cck-overlay-default
        [hasBackdrop]="cckControl.hasBackdrop"
        [disableBackdropClose]="cckControl.disableBackdropClose"
        [animationType]="cckControl.animationType">
      </cck-overlay-default>
    `,
  }),
};
