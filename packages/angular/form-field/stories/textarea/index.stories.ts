import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { moduleMetadata } from '@storybook/angular';

import { ThemeConfigToken } from '@cocokits/angular-core';
import { AngularStoriesMeta } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import descriptionMd from './description.md';
import { ErrorComponent, FormFieldComponent, LabelComponent } from '../../src';
import { TextareaComponent } from '../../src/lib/textarea/textarea.component';

export { Default } from './default.stories';
export { AutoResize } from './auto-resize.stories';
export { NgModel } from './ng-model.stories';
export { ReactiveForm } from './reactive-form.stories';

const meta: AngularStoriesMeta = {
  component: TextareaComponent,
  title: 'UI Components/Textarea',
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [FormFieldComponent, LabelComponent, ErrorComponent, CommonModule, FormsModule, ReactiveFormsModule],
      providers: [
        {
          provide: ThemeConfigToken,
          useFactory: () => getSelectedCckTheme()?.themeConfig,
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
    disabled: { table: { type: { summary: 'boolean' }, defaultValue: { summary: '' } } },
    _required: { table: { type: { summary: 'boolean' }, defaultValue: { summary: '' } } },
  },
  args: {},
};
export default meta;
