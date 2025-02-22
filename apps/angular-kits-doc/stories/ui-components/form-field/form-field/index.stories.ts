import { applicationConfig, moduleMetadata } from '@storybook/angular';

import { _UiBaseComponent } from '@cocokits/angular-core';
import {
  ChipListComponent,
  ErrorComponent,
  FormFieldComponent,
  HintComponent,
  InputComponent,
  LabelComponent,
  LeadingComponent,
  OptionComponent,
  PrefixComponent,
  SelectComponent,
  SuffixComponent,
  TextareaComponent,
  TrailingComponent,
} from '@cocokits/angular-form-field';
import { SvgIconComponent } from '@cocokits/angular-icon';
import { StoriesMeta, withThemeConfigProvider } from '@cocokits/storybook-addon-theme-angular';

import descriptionMd from './description.md';

export { Input } from './input.stories';
export { Textarea } from './textarea.stories';
export { Select } from './select.stories';
export { ChipList } from './chip-list.stories';

export { Password } from './examples/password/index.example.stories';
export { EmailValidation } from './examples/email-validation/index.example.stories';
export { InputLink } from './examples/input-link/index.example.stories';

const meta: StoriesMeta = {
  component: FormFieldComponent,
  subcomponents: [
    _UiBaseComponent,
    LabelComponent,
    LeadingComponent,
    TrailingComponent,
    PrefixComponent,
    SuffixComponent,
    HintComponent,
    ErrorComponent,
  ],
  title: 'UI Components/FormField',
  decorators: [
    applicationConfig({
      providers: [withThemeConfigProvider()],
    }),
    moduleMetadata({
      imports: [
        LabelComponent,
        InputComponent,
        HintComponent,
        ErrorComponent,
        SuffixComponent,
        PrefixComponent,
        LeadingComponent,
        TrailingComponent,
        SvgIconComponent,
        TextareaComponent,
        SelectComponent,
        OptionComponent,
        ChipListComponent,
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd].join('\n'),
      },
    },
    cckAddon: {
      componentName: 'formField',
      subcomponentNames: {
        LabelComponent: 'label',
        LeadingComponent: 'leading',
        TrailingComponent: 'trailing',
        PrefixComponent: 'prefix',
        SuffixComponent: 'suffix',
        HintComponent: 'hint',
        ErrorComponent: 'error',
      },
    },
  },
  argTypes: {
    disabled: { table: { type: { summary: 'boolean' }, defaultValue: { summary: '' } } },
  },
};
export default meta;
