import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { componentWrapperDecorator, moduleMetadata } from '@storybook/angular';

import { UIComponentConfig } from '@cocokits/angular-core';
import { AngularStoriesMeta } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { CheckboxIndeterminateComponent } from './components/checkbox-indeterminate/checkbox-indeterminate.component';
import descriptionMd from './description.md';
import { CheckboxComponent } from '../../src/lib/checkbox/checkbox.component';

export { Default } from './default.stories';
export { Indeterminate } from './indeterminate.stories';
export { Size } from './size.stories';
export { Color } from './color.stories';
export { NgModel } from './ng-model.stories';
export { ReactiveForm } from './reactive-form.stories';

const meta: AngularStoriesMeta = {
  component: CheckboxComponent,
  title: 'UI Components/Checkbox',
  tags: ['autodocs'],
  decorators: [
    componentWrapperDecorator((story) => `<div class="flex gap-24">${story}</div>`),
    moduleMetadata({
      imports: [CheckboxIndeterminateComponent, FormsModule, ReactiveFormsModule],
      providers: [
        {
          provide: UIComponentConfig,
          useFactory: () => getSelectedCckTheme()?.uiComponentConfig,
        },
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd].join('\n'),
      },
    },
  },
  argTypes: {
    _disabled: { table: { type: { summary: 'boolean' }, defaultValue: { summary: '' } } },
  },
  args: {},
};
export default meta;
