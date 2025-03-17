import { applicationConfig, moduleMetadata } from '@storybook/angular';

import { ErrorComponent, FormFieldComponent, InputComponent, LabelComponent } from '@cocokits/angular-form-field';
import { StoriesMeta, withThemeConfigProvider } from '@cocokits/storybook-addon-theme-angular';

import descriptionMd from './description.md';

export { Default } from './overview/default.stories';

const meta: StoriesMeta = {
  component: InputComponent,
  title: 'UI Components/Input',
  decorators: [
    applicationConfig({
      providers: [withThemeConfigProvider()],
    }),
    moduleMetadata({
      imports: [FormFieldComponent, LabelComponent, ErrorComponent],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd].join('\n'),
      },
    },
    cckAddon: {
      componentName: 'input',
    },
  },
  argTypes: {
    _type: { table: { useComponentApi: true, type: { summary: 'string' }, defaultValue: { summary: '' } } },
    disabled: { table: { type: { summary: 'boolean' }, defaultValue: { summary: '' } } },
    _required: { table: { type: { summary: 'boolean' }, defaultValue: { summary: '' } } },
  },
};
export default meta;
