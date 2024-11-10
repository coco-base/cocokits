import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { moduleMetadata } from '@storybook/angular';

import { ThemeConfigToken } from '@cocokits/angular-core';
import { AngularStoriesMeta, AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { ErrorComponent, FormFieldComponent, LabelComponent } from '../../src';
import { SelectComponent } from '../../src/lib/select/select.component';

const meta: AngularStoriesMeta = {
  component: SelectComponent,
  title: 'Dev/Select',
  tags: ['!autodocs'],
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
