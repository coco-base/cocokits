import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { componentWrapperDecorator, moduleMetadata } from '@storybook/angular';

import { AngularStoriesMeta } from '@cocokits/core';
import { UIComponentConfig } from '@cocokits/core/angular';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import descriptionMd from './description.md';
import { RadioButtonComponent, RadioGroupComponent } from '../../src/lib/radio/radio.component';

export { Default } from './default.stories';
export { Type } from './type.stories';
export { Size } from './size.stories';
export { Color } from './color.stories';
export { NgModel } from './ng-model.stories';
export { ReactiveForm } from './reactive-form.stories';

const meta: AngularStoriesMeta = {
  component: RadioGroupComponent,
  title: 'UI Components/RadioGroup',
  tags: ['autodocs'],
  decorators: [
    componentWrapperDecorator((story) => `<div class="flex gap-24">${story}</div>`),
    moduleMetadata({
      imports: [RadioButtonComponent, FormsModule, ReactiveFormsModule],
      providers: [
        {
          provide: UIComponentConfig,
          useValue: getSelectedCckTheme()?.uiComponentConfig,
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
  argTypes: {},
  args: {},
};
export default meta;
