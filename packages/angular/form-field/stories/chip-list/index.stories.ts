import { applicationConfig, moduleMetadata } from '@storybook/angular';

import { StoriesMeta, withThemeConfigProvider, withWrapperDecorator } from '@cocokits/storybook-addon-theme-angular';

import descriptionMd from './description.md';
import {
  ChipComponent,
  ErrorComponent,
  FormFieldComponent,
  LabelComponent,
  OptionComponent,
  OptionGroupComponent,
  SelectPreviewComponent,
} from '../../src';
import { ChipListComponent } from '../../src/lib/chip-list/chip-list.component';

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
