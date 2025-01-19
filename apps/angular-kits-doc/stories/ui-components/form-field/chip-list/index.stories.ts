import { applicationConfig, moduleMetadata } from '@storybook/angular';

import {
  ChipComponent,
  ChipListComponent,
  ErrorComponent,
  FormFieldComponent,
  LabelComponent,
  OptionComponent,
  OptionGroupComponent,
  SelectPreviewComponent,
} from '@cocokits/angular-form-field';
import { StoriesMeta, withThemeConfigProvider, withWrapperDecorator } from '@cocokits/storybook-addon-theme-angular';

import descriptionMd from './description.md';

export { Default } from './default.stories';
export { Size } from './size.stories';

const meta: StoriesMeta = {
  component: ChipListComponent,
  title: 'UI Components/ChipList',
  decorators: [
    withWrapperDecorator({}, { maxWidth: '530px' }),
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
        ChipComponent,
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
      componentName: 'chipList',
    },
  },
  argTypes: {
    disabled: { table: { type: { summary: 'boolean' }, defaultValue: { summary: '' } } },
    chipsChange: { table: { category: 'outputs' } },
  },
};
export default meta;
