import { applicationConfig, moduleMetadata } from '@storybook/angular';

import { ErrorComponent, FormFieldComponent, LabelComponent, TextareaComponent } from '@cocokits/angular-form-field';
import { StoriesMeta, withThemeConfigProvider } from '@cocokits/storybook-addon-theme-angular';

import descriptionMd from './description.md';

export { Default } from './default.stories';
export { AutoResize } from './auto-resize.stories';
export { Color } from './color.stories';
export { Size } from './size.stories';
export { Type } from './type.stories';

const meta: StoriesMeta = {
  component: TextareaComponent,
  title: 'UI Components/Textarea',
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
      componentName: 'textarea',
    },
  },
  argTypes: {
    minRows: { table: { type: { summary: 'number' }, defaultValue: { summary: '2' } } },
    disabled: { table: { type: { summary: 'boolean' }, defaultValue: { summary: '' } } },
    _required: { table: { type: { summary: 'boolean' }, defaultValue: { summary: '' } } },
  },
};
export default meta;
