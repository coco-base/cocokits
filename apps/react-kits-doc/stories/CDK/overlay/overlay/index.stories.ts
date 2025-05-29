import { Overlay } from '@cocokits/react-components';
import { StoriesMeta } from '@cocokits/storybook-addon-theme-react';

import descriptionMd from './description.md?raw';

export { Standalone } from './overview/standalone/standalone.stories';
export { Portal } from './overview/portal/portal.stories';
export { PortalAsComponent } from './overview/portal-as-component/portal-as-component.stories';

const meta: StoriesMeta<typeof Overlay> = {
  component: Overlay,
  title: 'CDK/Overlay',
  // subcomponents: [OverlayService],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd].join('\n'),
      },
    },
    cckAddon: {
      componentName: 'overlay',
    },
  },
};
export default meta;
