import { moduleMetadata } from '@storybook/angular';

import { ThemeConfigToken } from '@cocokits/angular-core';
import { AngularStoriesMeta, AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { FormFieldComponent, LabelComponent } from '../../src';
import { InputComponent } from '../../src/lib/input/input.component';

const meta: AngularStoriesMeta = {
  component: InputComponent,
  title: 'Dev/Input',
  tags: ['!autodocs'],
  decorators: [
    moduleMetadata({
      imports: [FormFieldComponent, LabelComponent],
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
    disabled: { control: 'boolean' },
    // color: { control: 'text' },
    // size: { control: 'text' },
  },
};

export default meta;

export const Default: AngularStoryObj<InputComponent> = {
  args: {
    // color: 'brand',
  },
  render: (args) => ({
    props: { ...args },
    template: `
      <div class="story-input">
        <input cckInput [type]="type" [disabled]="disabled"/>
      </div>
    `,
  }),
};
