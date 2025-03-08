import { IconButton } from '@cocokits/react-button';
import { StoriesMeta } from '@cocokits/storybook-addon-theme-react';

import descriptionMd from './description.md?raw';

export { Default } from './overview/default.stories';
export { Type } from './overview/type.stories';
export { Size } from './overview/size.stories';
export { Color } from './overview/color.stories';
export { ModeToggleStory } from './examples/mode-toggle/index.example.stories';
export { SocialButtonsStory } from './examples/social-buttons/index.example.stories';
export { VolumeButtonStory } from './examples/volume-button/index.example.stories';

const meta: StoriesMeta<typeof IconButton> = {
  component: IconButton,
  title: 'UI Components/IconButton',
  decorators: [],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd].join('\n'),
      },
    },
    cckAddon: {
      componentName: 'iconButton',
    },
  },
  argTypes: {},
};
export default meta;
