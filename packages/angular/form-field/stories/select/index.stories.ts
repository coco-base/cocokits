import { applicationConfig, moduleMetadata } from '@storybook/angular';

import { StoriesMeta, withThemeConfigProvider, withWrapperDecorator } from '@cocokits/storybook-addon-theme-angular';

import descriptionMd from './description.md';
import {
  ErrorComponent,
  FormFieldComponent,
  LabelComponent,
  OptionComponent,
  OptionGroupComponent,
  SelectPreviewComponent,
} from '../../src';
import { SelectComponent } from '../../src/lib/select/select.component';

export { Default } from './default.stories';
export { Size } from './size.stories';
export { CustomPreview } from './custom-preview.stories';
export { OptionGroup } from './option-group.stories';
// export { NgModel } from './ng-model.stories';
// export { ReactiveForm } from './reactive-form.stories';

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
