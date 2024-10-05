import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { componentWrapperDecorator, moduleMetadata } from '@storybook/angular';

import { _UiBaseComponent, UIComponentConfig } from '@cocokits/angular-core';
import { SvgIconComponent } from '@cocokits/angular-icon';
import { AngularStoriesMeta } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import descriptionMd from './description.md';
import {
  ChipListComponent,
  ErrorComponent,
  HintComponent,
  InputComponent,
  LabelComponent,
  LeadingComponent,
  OptionComponent,
  PrefixComponent,
  SelectComponent,
  SuffixComponent,
  TextareaComponent,
  TrailingComponent,
} from '../../src';
import { FormFieldComponent } from '../../src/lib/form-field/form-field.component';

export { Default } from './default.stories';
export { Color } from './color.stories';
export { Size } from './size.stories';
export { ThemeCocokitsHintError } from './theme-cocokits-hint-error.stories';
export { ThemeCocokitsPrefixSuffix } from './theme-cocokits-prefix-suffix.stories';
export { ThemeCocokitsLeading } from './theme-cocokits-leading.stories';
export { ThemeCocokitsTrailing } from './theme-cocokits-trailing.stories';
export { ThemeFramesXLeadingTrailing } from './theme-frames-x-leading-trailing.stories';

const meta: AngularStoriesMeta = {
  component: FormFieldComponent,
  subcomponents: [
    _UiBaseComponent,
    LabelComponent,
    LeadingComponent,
    TrailingComponent,
    PrefixComponent,
    SuffixComponent,
    HintComponent,
    ErrorComponent,
  ],
  title: 'UI Components/FormField',
  tags: ['autodocs'],
  decorators: [
    componentWrapperDecorator((story) => `<div class="flex gap-24 story-min-h-300">${story}</div>`),
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        LabelComponent,
        InputComponent,
        HintComponent,
        ErrorComponent,
        SuffixComponent,
        PrefixComponent,
        LeadingComponent,
        TrailingComponent,
        SvgIconComponent,
        TextareaComponent,
        SelectComponent,
        OptionComponent,
        ChipListComponent,
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
  },
  args: {},
};
export default meta;
