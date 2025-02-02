import { Select } from '@cocokits/react-form-field';
import { StoriesMeta } from '@cocokits/storybook-addon-theme-react';

import descriptionMd from './description.md?raw';

export { Default } from './overview/default.stories';
export { Options } from './overview/options.stories';
// export { Size } from './size.stories';
// export { CustomPreview } from './custom-preview.stories';
// export { OptionGroup } from './option-group.stories';

const meta: StoriesMeta<typeof Select> = {
  component: Select,
  // subcomponents: [OptionGroupComponent, OptionComponent, SelectPreviewComponent],
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
      //   subcomponentArgsTypes: {
      //     OptionComponent: {
      //       _disabled: { name: 'disabled', table: { type: { summary: 'boolean' }, defaultValue: { summary: '' } } },
      //     },
      //     OptionGroupComponent: {
      //       disabled: { table: { type: { summary: 'boolean' }, defaultValue: { summary: '' } } },
      //     },
      //   },
      //   subcomponentNames: {
      //     OptionComponent: 'option',
      //     OptionGroupComponent: 'optionGroup',
      //     SelectPreviewComponent: 'selectPreview',
      //   },
    },
  },
};

export default meta;
