import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { moduleMetadata } from '@storybook/angular';

import { UIComponentConfig } from '@cocokits/angular-core';
import { AngularStoriesMeta } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import descriptionMd from './description.md';
import { ErrorComponent, FormFieldComponent, LabelComponent } from '../../src';
import { InputComponent } from '../../src/lib/input/input.component';

export { Default } from './default.stories';
export { NativeType } from './native-type.stories';
export { NgModel } from './ng-model.stories';
export { ReactiveForm } from './reactive-form.stories';

const meta: AngularStoriesMeta = {
  component: InputComponent,
  title: 'UI Components/Input',
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [FormFieldComponent, LabelComponent, ErrorComponent, CommonModule, FormsModule, ReactiveFormsModule],
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
    _type: { table: { useComponentApi: true, type: { summary: 'string' }, defaultValue: { summary: '' } } },
    disabled: { table: { type: { summary: 'boolean' }, defaultValue: { summary: '' } } },
    _required: { table: { type: { summary: 'boolean' }, defaultValue: { summary: '' } } },
  },
  args: {},
};
export default meta;
