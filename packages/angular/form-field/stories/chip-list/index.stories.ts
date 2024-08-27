import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { componentWrapperDecorator, moduleMetadata } from '@storybook/angular';

import { UIComponentConfig } from '@cocokits/angular-core';
import { AngularStoriesMeta } from '@cocokits/core';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import descriptionMd from './description.md';
import {
  ErrorComponent,
  FormFieldComponent,
  LabelComponent,
  OptionComponent,
  OptionGroupComponent,
  SelectPreviewComponent,
} from '../../src';
import { ChipListComponent } from '../../src/lib/chip-list/chip-list.component';

export { Default } from './default.stories';

const meta: AngularStoriesMeta = {
  component: ChipListComponent,
  title: 'UI Components/ChipList',
  tags: ['autodocs'],
  decorators: [
    componentWrapperDecorator((story) => `<div class="flex gap-24">${story}</div>`),
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
      ],
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
  argTypes: {
    // Example of: using component API insteadof Theme API or Disable from ArgTable
    // type: { table: { useComponentApi: true, disable: true } },
  },
  args: {},
};
export default meta;
