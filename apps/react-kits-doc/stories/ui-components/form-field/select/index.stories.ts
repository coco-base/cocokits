import { Option, OptionGroup, Select, SelectPreview } from '@cocokits/react-form-field';
import { StoriesMeta } from '@cocokits/storybook-addon-theme-react';

import descriptionMd from './description.md?raw';

export { Default } from './overview/default.stories';
export { Options } from './overview/options.stories';
export { CustomPreview } from './overview/custom-preview.stories';
export { Type } from './overview/type.stories';
export { Size } from './overview/size.stories';
export { Color } from './overview/color.stories';
export { ErrorState } from './overview/error-state.stories';

const meta: StoriesMeta<typeof Select> = {
  component: Select,
  subcomponents: { OptionGroup, Option, SelectPreview },
  title: 'UI Components/Select',
  decorators: [],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd].join('\n'),
      },
    },
    cckAddon: {
      componentName: 'select',
      subcomponents: {
        Option: { name: 'option' },
        OptionGroup: { name: 'optionGroup' },
        SelectPreview: { name: 'selectPreview' },
      },
    },
  },
};

export default meta;
