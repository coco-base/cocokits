import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { moduleMetadata } from '@storybook/angular';

import { ThemeConfigToken } from '@cocokits/angular-core';
import { AngularStoriesMeta } from '@cocokits/internal-model';
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
    moduleMetadata({
      imports: [RadioButtonComponent, FormsModule, ReactiveFormsModule],
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
    _disabled: { table: { type: { summary: 'boolean' }, defaultValue: { summary: '' } } },
    change: { table: { category: 'outputs' } },
  },
  args: {},
};
export default meta;
