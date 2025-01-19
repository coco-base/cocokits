import { applicationConfig, moduleMetadata } from '@storybook/angular';

import {
  ChipComponent,
  ErrorComponent,
  FormFieldComponent,
  LabelComponent,
  OptionComponent,
  OptionGroupComponent,
  SelectPreviewComponent,
} from '@cocokits/angular-form-field';
import { StoriesMeta, withThemeConfigProvider } from '@cocokits/storybook-addon-theme-angular';

import descriptionMd from './description.md';

export { Default } from './default.stories';
export { Type } from './type.stories';
export { Size } from './size.stories';
export { Color } from './color.stories';

const meta: StoriesMeta = {
  component: ChipComponent,
  title: 'UI Components/Chip',
  decorators: [
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
      componentName: 'chip',
    },
  },
};
export default meta;
