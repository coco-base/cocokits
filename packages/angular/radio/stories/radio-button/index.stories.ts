import { applicationConfig, moduleMetadata } from '@storybook/angular';

import { AngularStoriesMeta } from '@cocokits/internal-model';
import { withThemeConfigProvider } from '@cocokits/storybook-addon-theme';

import descriptionMd from './description.md';
import { RadioButtonComponent, RadioGroupComponent } from '../../src/lib/radio/radio.component';

export { Default } from './default.stories';
export { Type } from './type.stories';
export { Size } from './size.stories';
export { Color } from './color.stories';

const meta: AngularStoriesMeta = {
  component: RadioButtonComponent,
  title: 'UI Components/RadioButton',
  decorators: [
    applicationConfig({
      providers: [withThemeConfigProvider()],
    }),
    moduleMetadata({
      imports: [RadioGroupComponent],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd].join('\n'),
      },
    },
    cckAddon: {
      componentName: 'radioButton',
    },
  },
  argTypes: {
    _disabled: { table: { type: { summary: 'boolean' }, defaultValue: { summary: '' } } },
    change: { table: { category: 'outputs' } },
  },
};
export default meta;
