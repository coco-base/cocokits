import { moduleMetadata } from '@storybook/angular';

import { AngularStoriesMeta } from '@cocokits/internal-model';
import { withThemeConfigProvider } from '@cocokits/storybook-addon-theme';

import descriptionMd from './description.md';
import { withWrapperDecorator } from '../../../../internal/storybook-addon-theme/src/lib/utils/base-preview';
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

const meta: AngularStoriesMeta = {
  component: ChipListComponent,
  title: 'UI Components/ChipList',
  decorators: [
    withWrapperDecorator({}, { maxWidth: '530px' }),
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
      providers: [withThemeConfigProvider()],
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
