import { applicationConfig, moduleMetadata } from '@storybook/angular';

import { AngularStoriesMeta } from '@cocokits/internal-model';
import { withThemeConfigProvider } from '@cocokits/storybook-addon-theme';

import descriptionMd from './description.md';
import {
  ErrorComponent,
  FormFieldComponent,
  LabelComponent,
  OptionComponent,
  OptionGroupComponent,
  SelectPreviewComponent,
} from '../../src';
import { ChipComponent } from '../../src/lib/chip/chip.component';

export { Default } from './default.stories';
export { Type } from './type.stories';
export { Size } from './size.stories';
export { Color } from './color.stories';

const meta: AngularStoriesMeta = {
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
