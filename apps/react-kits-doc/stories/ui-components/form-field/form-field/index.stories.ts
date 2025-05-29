import { Error, FormField, Hint, Label, Leading, Prefix, Suffix, Trailing } from '@cocokits/react-form-field';
import { StoriesMeta } from '@cocokits/storybook-addon-theme-react';

import descriptionMd from './description.md?raw';

export { Input } from './overview/input.stories';
export { Textarea } from './overview/textarea.stories';
export { Select } from './overview/select.stories';
export { ChipList } from './overview/chip-list.stories';

export { PasswordStory } from './examples/password/index.example.stories';
export { InputLinkStory } from './examples/input-link/index.example.stories';
export { InputSuffixSuccessStory } from './examples/input-suffix-success/index.example.stories';
export { InputHintSuccessStory } from './examples/input-hint-success/index.example.stories';
export { EmailValidationStory } from './examples/email-validation/index.example.stories';
export { PrefixSuffixSearchStory } from './examples/prefix-suffix-search/index.example.stories';
export { LeadingWebsiteStory } from './examples/leading-website/index.example.stories';
export { TrailingDomainStory } from './examples/trailing-domain/index.example.stories';
export { LeadingIconStory } from './examples/leading-icon/index.example.stories';
export { TrailingCopyStory } from './examples/trailing-copy/index.example.stories';
export { TrailingSelectAmountStory } from './examples/trailing-select-amount/index.example.stories';
export { TrailingCustomColorStory } from './examples/trailing-custom-color/index.example.stories';
export { PrefixIconSelectStory } from './examples/prefix-icon-select/index.example.stories';
export { SuffixCardPatternStory } from './examples/suffix-card-pattern/index.example.stories';
export { SelectPreviewTagStory } from './examples/select-preview-tag/index.example.stories';
export { PhoneNumberStory } from './examples/phone-number/index.example.stories';
export { TextareaMaxCharStory } from './examples/textarea-max-char/index.example.stories';
export { InputSideLabelStory } from './examples/input-side-label/index.example.stories';
export { LeadingCurrencyStory } from './examples/leading-currency/index.example.stories';

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
      subcomponents: {
        Label: { name: 'label' },
        Leading: { name: 'leading' },
        Trailing: { name: 'trailing' },
        Prefix: { name: 'prefix' },
        Suffix: { name: 'suffix' },
        Hint: { name: 'hint' },
        Error: { name: 'error' },
      },
    },
  },
};
export default meta;
