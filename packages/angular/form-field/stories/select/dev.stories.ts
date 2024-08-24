import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { componentWrapperDecorator, moduleMetadata } from '@storybook/angular';

import { UIComponentConfig } from '@cocokits/angular-core';
import { AngularStoriesMeta, AngularStoryObj } from '@cocokits/core';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { ErrorComponent, FormFieldComponent, LabelComponent } from '../../src';
import { SelectComponent } from '../../src/lib/select/select.component';

const meta: AngularStoriesMeta = {
  component: SelectComponent,
  title: 'Dev/Select',
  tags: ['!autodocs'],
  decorators: [
    componentWrapperDecorator((story) => `<div class="flex gap-24">${story}</div>`),
    moduleMetadata({
      imports: [FormFieldComponent, LabelComponent, ErrorComponent, CommonModule, FormsModule, ReactiveFormsModule],
      providers: [
        {
          provide: UIComponentConfig,
          useValue: getSelectedCckTheme()?.uiComponentConfig,
        },
      ],
    }),
  ],
  argTypes: {
    type: { control: 'text' },
    color: { control: 'text' },
    size: { control: 'text' },
  },
};

export default meta;

export const Default: AngularStoryObj<SelectComponent> = {
  args: {
    // color: 'brand',
  },
};
