import { Error, FormField, Hint, Label, Leading, Prefix, Suffix, Trailing } from '@cocokits/react-form-field';
import { StoriesMeta } from '@cocokits/storybook-addon-theme-react';

import descriptionMd from './description.md?raw';

export { Input } from './overview/input.stories';
export { Textarea } from './overview/textarea.stories';
export { Select } from './overview/select.stories';
export { ChipList } from './overview/chip-list.stories';

export { PasswordStory } from './examples/password/index.example.stories';
export { EmailValidationStory } from './examples/email-validation/index.example.stories';
export { InputLinkStory } from './examples/input-link/index.example.stories';

const meta: StoriesMeta<typeof FormField> = {
  component: FormField,
  subcomponents: {
    Label,
    Leading,
    Trailing,
    Prefix,
    Suffix,
    Hint,
    Error,
  },
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
      subcomponentNames: {
        Label: 'label',
        Leading: 'leading',
        Trailing: 'trailing',
        Prefix: 'prefix',
        Suffix: 'suffix',
        Hint: 'hint',
        Error: 'error',
      },
    },
  },
};
export default meta;
