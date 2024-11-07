import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { moduleMetadata } from '@storybook/angular';

import { ThemeConfigToken } from '@cocokits/angular-core';
import { SvgIconComponent } from '@cocokits/angular-icon';
import { AngularStoriesMeta, AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import {
  ErrorComponent,
  HintComponent,
  InputComponent,
  LabelComponent,
  LeadingComponent,
  PrefixComponent,
  SuffixComponent,
  TrailingComponent,
} from '../../src';
import { FormFieldComponent } from '../../src/lib/form-field/form-field.component';
import { copyIcon, dollarIcon, emailIcon, infoIcon } from '../template-svg-icon';

const meta: AngularStoriesMeta = {
  component: FormFieldComponent,
  title: 'Dev/FormField',
  tags: ['!autodocs'],
  decorators: [
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
      ],
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
    label: { control: 'text' },
    hideRequiredMarker: { control: 'boolean' },
    placeholder: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },

    inputDisabled: { control: 'boolean' },
    formFieldDisabled: { control: 'boolean' },

    suffix: { control: 'boolean' },
    prefix: { control: 'boolean' },

    leading: { control: 'boolean' },
    leadingColor: { control: 'text' },
    leadingClickable: { control: 'boolean' },
    leadingType: { control: 'text' },

    trailing: { control: 'boolean' },
    trailingColor: { control: 'text' },
    trailingClickable: { control: 'boolean' },
    trailingType: { control: 'text' },
  },
};

export default meta;

export const Default: AngularStoryObj<FormFieldComponent & Record<string, any>> = {
  args: {
    label: 'Email',
    hideRequiredMarker: false as any,
    placeholder: 'miladfm@gmail.com',
    hint: 'This a hint text',
    size: 'md' as any,
    suffix: true,
    prefix: true,
    leading: true,
    trailing: true,
    leadingClickable: false,
    trailingClickable: false,
  },
  render: (args) => ({
    props: {
      ...args,
      infoIcon,
      dollarIcon,
      emailIcon,
      copyIcon,
    },
    template: `
      <cck-form-field
        [hideRequiredMarker]="hideRequiredMarker"
        [disabled]="formFieldDisabled"
        [size]="size">
        @if(leading) {
          <cck-leading [clickable]="leadingClickable" [color]="leadingColor" [type]="leadingType">https://</cck-leading>
        }
        @if(trailing) {
          <cck-trailing [clickable]="trailingClickable" [color]="trailingColor" [type]="trailingType">
            <cck-svg-icon [icon]="copyIcon"/>
            <span>Copy</span>
          </cck-trailing>
        }
        
        @if(label) {
          <cck-label>{{label}}</cck-label>
        }
        
        @if(prefix) {
          <cck-prefix>
            <cck-svg-icon [icon]="emailIcon"></cck-svg-icon>  
          </cck-prefix>
        }
        
        <input [placeholder]="placeholder" [disabled]="inputDisabled" cckInput/>
        
        @if(suffix) {
          <cck-suffix>
            <cck-svg-icon [icon]="infoIcon"></cck-svg-icon>  
          </cck-suffix>
        }
        
        @if(hint) {
          <cck-hint>{{hint}}</cck-hint>
        }
        
        @if(error) {
          <cck-error>{{error}}</cck-error>
        }
      </cck-form-field>
    `,
  }),
};
