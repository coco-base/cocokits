import { moduleMetadata } from '@storybook/angular';

import { AngularStoriesMeta } from '@cocokits/internal-model';
import { withThemeConfigProvider } from '@cocokits/storybook-addon-theme';

import { CheckboxIndeterminateComponent } from './components/checkbox-indeterminate/checkbox-indeterminate.component';
import descriptionMd from './description.md';
import { CheckboxComponent } from '../../src/lib/checkbox/checkbox.component';

export { Default } from './default.stories';
export { Size } from './size.stories';
export { Color } from './color.stories';
export { Indeterminate } from './indeterminate.stories';
// export { NgModel } from './ng-model.stories';
// export { ReactiveForm } from './reactive-form.stories';

const meta: AngularStoriesMeta = {
  component: CheckboxComponent,
  title: 'UI Components/Checkbox',
  decorators: [
    moduleMetadata({
      imports: [CheckboxIndeterminateComponent],
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
      componentName: 'checkbox',
    },
  },
};
export default meta;
