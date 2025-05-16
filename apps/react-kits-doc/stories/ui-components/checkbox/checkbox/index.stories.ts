import { Checkbox } from '@cocokits/react-checkbox';
import { StoriesMeta } from '@cocokits/storybook-addon-theme-react';

import descriptionMd from './description.md?raw';

export { Default } from './overview/default.stories';
export { Size } from './overview/size.stories';
export { Color } from './overview/color.stories';
export { CheckboxLabelThroughStory } from './examples/checkbox-label-through/index.example.stories';
export { CheckboxLabelLinkStory } from './examples/checkbox-label-link/index.example.stories';
export { CheckboxGroupColumnStory } from './examples/checkbox-group-column/index.example.stories';
export { CheckboxGroupRowStory } from './examples/checkbox-group-row/index.example.stories';
export { CheckboxBoxSelectionStory } from './examples/checkbox-box-selection/index.example.stories';
export { CheckboxBoxSelectionInfoStory } from './examples/checkbox-box-selection-info/index.example.stories';

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
