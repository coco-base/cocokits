import { Checkbox } from '@cocokits/react-checkbox';
import { StoriesMeta } from '@cocokits/storybook-addon-theme-react';

import descriptionMd from './description.md?raw';

export { Default } from './overview/default.stories';
export { Size } from './overview/size.stories';
export { Color } from './overview/color.stories';
export { CheckboxLabelThroughStory } from './examples/checkbox-label-through/index.example.stories';

const meta: StoriesMeta<typeof Checkbox> = {
  component: Checkbox,
  title: 'UI Components/Checkbox',
  parameters: {
    docs: {
      description: {
        component: [descriptionMd].join('\n'),
      },
    },
    cckAddon: {
      componentName: 'checkbox',
    },
  },
};
export default meta;
