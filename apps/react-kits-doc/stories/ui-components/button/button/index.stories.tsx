import { Button } from '@cocokits/react-button';
import { StoriesMeta } from '@cocokits/storybook-addon-theme-react';

import descriptionMd from './description.md?raw';
export { VolumeButtonStory } from './examples/volume-button/_volume-button.stories';

export { Default } from './overview/default.stories';
export { Type } from './overview/type.stories';
export { Size } from './overview/size.stories';
export { Color } from './overview/color.stories';

const meta: StoriesMeta<typeof Button> = {
  component: Button,
  title: 'UI Components/Button',
  decorators: [],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd].join('\n'),
      },
    },
    cckAddon: {
      componentName: 'button',
    },
  },
  argTypes: {},
};
export default meta;
