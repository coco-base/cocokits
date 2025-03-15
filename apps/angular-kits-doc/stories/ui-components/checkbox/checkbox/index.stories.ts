import { applicationConfig, moduleMetadata } from '@storybook/angular';

import { CheckboxComponent } from '@cocokits/angular-checkbox';
import { StoriesMeta, withThemeConfigProvider, withWrapperDecorator } from '@cocokits/storybook-addon-theme-angular';

import descriptionMd from './description.md';

export { Default } from './default.stories';
export { Size } from './size.stories';
export { Color } from './color.stories';
export { CheckboxLabelThrough } from './examples/checkbox-label-through/index.example.stories';
// export { Indeterminate } from './indeterminate.stories';
// export { NgModel } from './ng-model.stories';
// export { ReactiveForm } from './reactive-form.stories';

const meta: StoriesMeta = {
  component: CheckboxComponent,
  title: 'UI Components/Checkbox',
  decorators: [
    withWrapperDecorator({ insideBox: true }),
    applicationConfig({
      providers: [withThemeConfigProvider()],
    }),
    moduleMetadata({
      imports: [],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd].join('\n'),
      },
    },
    cckAddon: {
      componentName: 'checkbox',
    },
  },
};
export default meta;
