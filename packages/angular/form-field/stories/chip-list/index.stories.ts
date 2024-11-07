import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { moduleMetadata } from '@storybook/angular';

import { ThemeConfigToken } from '@cocokits/angular-core';
import { AngularStoriesMeta } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import descriptionMd from './description.md';
import {
  ChipComponent,
  ErrorComponent,
  FormFieldComponent,
  LabelComponent,
  OptionComponent,
  OptionGroupComponent,
  SelectPreviewComponent,
} from '../../src';
import { ChipListComponent } from '../../src/lib/chip-list/chip-list.component';

export { Default } from './default.stories';
export { Size } from './size.stories';

const meta: AngularStoriesMeta = {
  component: ChipListComponent,
  title: 'UI Components/ChipList',
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [
        FormFieldComponent,
        LabelComponent,
        ErrorComponent,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        OptionComponent,
        OptionGroupComponent,
        SelectPreviewComponent,
        BrowserAnimationsModule,
        ChipComponent,
      ],
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
    chipsChange: { table: { category: 'outputs' } },
  },
  args: {},
};
export default meta;
