import { applicationConfig, moduleMetadata } from '@storybook/angular';

import {
  ErrorComponent,
  FormFieldComponent,
  LabelComponent,
  OptionComponent,
  OptionGroupComponent,
  SelectComponent,
  SelectPreviewComponent,
} from '@cocokits/angular-form-field';
import { StoriesMeta, withThemeConfigProvider, withWrapperDecorator } from '@cocokits/storybook-addon-theme-angular';

import descriptionMd from './description.md';

export { Default } from './overview/default.stories';
export { Size } from './overview/size.stories';
export { CustomPreview } from './overview/custom-preview.stories';
export { OptionGroup } from './overview/option-group.stories';

const meta: StoriesMeta = {
  component: SelectComponent,
  subcomponents: [OptionGroupComponent, OptionComponent, SelectPreviewComponent],
  title: 'UI Components/Select',
  decorators: [
    withWrapperDecorator({}, { minWidth: '250px' }),
    applicationConfig({
      providers: [withThemeConfigProvider()],
    }),
    moduleMetadata({
      imports: [
        FormFieldComponent,
        LabelComponent,
        ErrorComponent,
        OptionComponent,
        OptionGroupComponent,
        SelectPreviewComponent,
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
      componentName: 'select',
      subcomponentArgsTypes: {
        OptionComponent: {
          _disabled: { name: 'disabled', table: { type: { summary: 'boolean' }, defaultValue: { summary: '' } } },
        },
        OptionGroupComponent: {
          disabled: { table: { type: { summary: 'boolean' }, defaultValue: { summary: '' } } },
        },
      },
      subcomponentNames: {
        OptionComponent: 'option',
        OptionGroupComponent: 'optionGroup',
        SelectPreviewComponent: 'selectPreview',
      },
    },
  },
  argTypes: {
    disabled: { table: { type: { summary: 'boolean' }, defaultValue: { summary: '' } } },
    isOpened: { table: { type: { summary: 'boolean' } } },
    _required: { name: 'required', table: { type: { summary: 'boolean' }, defaultValue: { summary: '' } } },
    selectionChange: { table: { category: 'outputs' } },
  },
};
export default meta;
