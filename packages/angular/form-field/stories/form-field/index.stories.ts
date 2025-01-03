import { applicationConfig, moduleMetadata } from '@storybook/angular';

import { _UiBaseComponent } from '@cocokits/angular-core';
import { SvgIconComponent } from '@cocokits/angular-icon';
import { StoriesMeta, withThemeConfigProvider } from '@cocokits/storybook-addon-theme-angular';

import descriptionMd from './description.md';
import {
  ChipListComponent,
  ErrorComponent,
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
} from '../../src';
import { FormFieldComponent } from '../../src/lib/form-field/form-field.component';

export { Input } from './input.stories';
export { Textarea } from './textarea.stories';
export { Select } from './select.stories';
export { ChipList } from './chip-list.stories';

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
