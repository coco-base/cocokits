import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { componentWrapperDecorator, moduleMetadata } from '@storybook/angular';

import { UIComponentConfig } from '@cocokits/angular-core';
import { AngularStoriesMeta } from '@cocokits/internal-model';
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
import { SelectComponent } from '../../src/lib/select/select.component';

export { Default } from './default.stories';
export { Size } from './size.stories';
export { CustomPreview } from './custom-preview.stories';
export { OptionGroup } from './option-group.stories';
export { NgModel } from './ng-model.stories';
export { ReactiveForm } from './reactive-form.stories';

const meta: AngularStoriesMeta = {
  component: SelectComponent,
  subcomponents: [OptionGroupComponent, OptionComponent, SelectPreviewComponent],
  title: 'UI Components/Select',
  tags: ['autodocs'],
  decorators: [
    componentWrapperDecorator((story) => `<div class="story-min-h-400" style="width: 100%">${story}</div>`),
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
    disabled: { table: { type: { summary: 'boolean' }, defaultValue: { summary: '' } } },
    isOpened: { table: { type: { summary: 'boolean' } } },
    _required: { table: { type: { summary: 'boolean' }, defaultValue: { summary: '' } } },
    selectionChange: { table: { category: 'outputs' } },

    _OptionComponent: {
      _disabled: { table: { type: { summary: 'boolean' }, defaultValue: { summary: '' } } },
    },

    _OptionGroupComponent: {
      disabled: { table: { type: { summary: 'boolean' }, defaultValue: { summary: '' } } },
    },
  },
  args: {},
};
export default meta;
