import { applicationConfig, moduleMetadata } from '@storybook/angular';

import { RadioButtonComponent, RadioGroupComponent } from '@cocokits/angular-radio';
import { StoriesMeta, withThemeConfigProvider } from '@cocokits/storybook-addon-theme-angular';

import descriptionMd from './description.md';

export { Default } from './default.stories';
export { Type } from './type.stories';
export { Size } from './size.stories';
export { Color } from './color.stories';

const meta: StoriesMeta = {
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
