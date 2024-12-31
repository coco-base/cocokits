import { applicationConfig, moduleMetadata } from '@storybook/angular';

import { AngularStoriesMeta } from '@cocokits/internal-model';
import { withThemeConfigProvider, withWrapperDecorator } from '@cocokits/storybook-addon-theme';

import descriptionMd from './description.md';
import { ErrorComponent, FormFieldComponent, LabelComponent } from '../../src';
import { InputComponent } from '../../src/lib/input/input.component';

export { Default } from './default.stories';
// export { NativeType } from './native-type.stories';
// export { NgModel } from './ng-model.stories';
// export { ReactiveForm } from './reactive-form.stories';

const meta: AngularStoriesMeta = {
  component: InputComponent,
  title: 'UI Components/Input',
  decorators: [
    withWrapperDecorator({}, { width: '200px' }),
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
