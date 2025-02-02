import { FormField } from '@cocokits/react-form-field';
import { StoriesMeta } from '@cocokits/storybook-addon-theme-react';

import descriptionMd from './description.md?raw';

export { Input } from './overview/input.stories';
// export { Textarea } from './textarea.stories';
export { Select } from './overview/select.stories';
// export { ChipList } from './chip-list.stories';

const meta: StoriesMeta<typeof FormField> = {
  component: FormField,
  // subcomponents: {
  //   Input
  // },
  //   _UiBaseComponent,
  //   LabelComponent,
  //   LeadingComponent,
  //   TrailingComponent,
  //   PrefixComponent,
  //   SuffixComponent,
  //   HintComponent,
  //   ErrorComponent,
  title: 'UI Components/FormField',
  decorators: [],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd].join('\n'),
      },
    },
    cckAddon: {
      componentName: 'formField',
      // subcomponentNames: {
      //   LabelComponent: 'label',
      //   LeadingComponent: 'leading',
      //   TrailingComponent: 'trailing',
      //   PrefixComponent: 'prefix',
      //   SuffixComponent: 'suffix',
      //   HintComponent: 'hint',
      //   ErrorComponent: 'error',
      // },
    },
  },
};
export default meta;
