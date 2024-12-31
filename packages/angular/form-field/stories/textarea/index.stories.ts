import { applicationConfig, moduleMetadata } from '@storybook/angular';

import { AngularStoriesMeta } from '@cocokits/internal-model';
import { withThemeConfigProvider } from '@cocokits/storybook-addon-theme';

import descriptionMd from './description.md';
import { ErrorComponent, FormFieldComponent, LabelComponent } from '../../src';
import { TextareaComponent } from '../../src/lib/textarea/textarea.component';

export { Default } from './default.stories';
export { AutoResize } from './auto-resize.stories';
// export { NgModel } from './ng-model.stories';
// export { ReactiveForm } from './reactive-form.stories';

const meta: AngularStoriesMeta = {
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
