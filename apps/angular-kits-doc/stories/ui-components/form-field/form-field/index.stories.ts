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

export { Input } from './overview/input.stories';
export { Textarea } from './overview/textarea.stories';
export { Select } from './overview/select.stories';
export { ChipList } from './overview/chip-list.stories';

export { Password } from './examples/password/index.example.stories';
export { InputLink } from './examples/input-link/index.example.stories';
export { InputSuffixSuccess } from './examples/input-suffix-success/index.example.stories';
export { InputHintSuccess } from './examples/input-hint-success/index.example.stories';
export { EmailValidation } from './examples/email-validation/index.example.stories';
export { PrefixSuffixSearch } from './examples/prefix-suffix-search/index.example.stories';
export { LeadingWebsite } from './examples/leading-website/index.example.stories';
export { TrailingDomain } from './examples/trailing-domain/index.example.stories';
export { LeadingIcon } from './examples/leading-icon/index.example.stories';
export { TrailingCopy } from './examples/trailing-copy/index.example.stories';
export { TrailingSelectAmount } from './examples/trailing-select-amount/index.example.stories';
export { TrailingCustomColor } from './examples/trailing-custom-color/index.example.stories';
export { PrefixIconSelect } from './examples/prefix-icon-select/index.example.stories';
export { SuffixCardPattern } from './examples/suffix-card-pattern/index.example.stories';
export { SelectPreviewTag } from './examples/select-preview-tag/index.example.stories';
export { PhoneNumber } from './examples/phone-number/index.example.stories';
export { TextareaMaxChar } from './examples/textarea-max-char/index.example.stories';
export { InputSideLabel } from './examples/input-side-label/index.example.stories';
export { LeadingCurrency } from './examples/leading-currency/index.example.stories';

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
      subcomponents: {
        LabelComponent: { name: 'label' },
        LeadingComponent: { name: 'leading' },
        TrailingComponent: { name: 'trailing' },
        PrefixComponent: { name: 'prefix' },
        SuffixComponent: { name: 'suffix' },
        HintComponent: { name: 'hint' },
        ErrorComponent: { name: 'error' },
      },
    },
  },
  argTypes: {
    disabled: { table: { type: { summary: 'boolean' }, defaultValue: { summary: '' } } },
  },
};
export default meta;
