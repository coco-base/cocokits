import { action } from '@storybook/addon-actions';
import { componentWrapperDecorator, moduleMetadata } from '@storybook/angular';

import { AngularStoriesMeta, AngularStoryObj } from '@cocokits/core';
import { UIComponentConfig } from '@cocokits/core/angular';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { RadioButtonComponent, RadioGroupComponent } from '../../src/lib/radio/radio.component';

const meta: AngularStoriesMeta = {
  component: RadioGroupComponent,
  title: 'Dev/RadioButton',
  tags: ['!autodocs'],
  decorators: [
    componentWrapperDecorator((story) => `<div class="flex gap-24">${story}</div>`),
    moduleMetadata({
      imports: [RadioButtonComponent],
      providers: [
        {
          provide: UIComponentConfig,
          useValue: getSelectedCckTheme()?.uiComponentConfig,
        },
      ],
    }),
  ],
  argTypes: {
    groupType: { control: 'text' },
    groupColor: { control: 'text' },
    groupSize: { control: 'text' },
    groupName: { control: 'text' },
    groupSelected: { control: 'text' },
    groupDisabled: { control: 'boolean' },

    radio1Type: { control: 'text' },
    radio1Color: { control: 'text' },
    radio1Size: { control: 'text' },
    radio1Name: { control: 'text' },
    radio1Checked: { control: 'boolean' },
    radio1Value: { control: 'text' },
    radio1Disabled: { control: 'boolean' },
    radio1Id: { control: 'text' },

    radio2Type: { control: 'text' },
    radio2Color: { control: 'text' },
    radio2Size: { control: 'text' },
    radio2Name: { control: 'text' },
    radio2Checked: { control: 'boolean' },
    radio2Value: { control: 'text' },
    radio2Disabled: { control: 'boolean' },
    radio2Id: { control: 'text' },
  },
};

export default meta;

export const Default: AngularStoryObj<any> = {
  args: {},
  argTypes: {
    groupName: { table: { disable: true } },
    radio1Name: { table: { disable: true } },
    radio2Name: { table: { disable: true } },
    radio1Value: { table: { disable: true } },
    radio2Value: { table: { disable: true } },
    radio1Id: { table: { disable: true } },
    radio2Id: { table: { disable: true } },
  },
  render: (args) => ({
    props: {
      ...args,
      radio1Value: 'Radio1Value',
      radio2Value: 'Radio2Value',
      onGroupChange: action('On Group Selected Change'),
      onChange: action('On Selected Change'),
    },
    template: `
      <cck-radio-group
        [type]="groupType"
        [color]="groupColor"
        [size]="groupSize"
        [selected]="groupSelected"
        [disabled]="groupDisabled"
        (change)="onGroupChange($event)">

          <cck-radio-button
            [type]="radio1Type"
            [color]="radio1Color"
            [size]="radio1Size"
            [checked]="radio1Checked"
            [value]="radio1Value"
            [disabled]="radio1Disabled"
            (change)="onChange($event)">
            Radio Button 1
          </cck-radio-button>

          <cck-radio-button
            [type]="radio2Type"
            [color]="radio2Color"
            [size]="radio2Size"
            [checked]="radio2Checked"
            [value]="radio2Value"
            [disabled]="radio2Disabled"
            (change)="onChange($event)">
            Radio Button 2
          </cck-radio-button>

      </cck-radio-group>
    `,
  }),
};

export const NameAndID: AngularStoryObj<RadioButtonComponent> = {
  args: {
    // color: 'brand',
  },
  parameters: {},
  render: (args) => ({
    props: {
      ...args,
      radio1Value: 'Radio1Value',
      radio2Value: 'Radio2Value',
    },
    template: `
      <cck-radio-group
        [type]="groupType"
        [color]="groupColor"
        [size]="groupSize"
        [name]="groupName"
        [selected]="groupSelected"
        [disabled]="groupDisabled">

          <cck-radio-button
            [type]="radio1Type"
            [color]="radio1Color"
            [size]="radio1Size"
            [name]="radio1Name"
            [checked]="radio1Checked"
            [value]="radio1Value"
            [disabled]="radio1Disabled"
            [id]="radio1Id">
            Radio Button 1
          </cck-radio-button>

          <cck-radio-button
            [type]="radio2Type"
            [color]="radio2Color"
            [size]="radio2Size"
            [name]="radio2Name"
            [checked]="radio2Checked"
            [value]="radio2Value"
            [disabled]="radio2Disabled"
            [id]="radio1Id">
            Radio Button 2
          </cck-radio-button>

      </cck-radio-group>
    `,
  }),
};

export const NgModel: AngularStoryObj<RadioButtonComponent> = {
  args: {
    // color: 'brand',
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <cck-radio-group>
        <cck-radio-button>Radio Button 1</cck-radio-button>
        <cck-radio-button>Radio Button 2</cck-radio-button>
      </cck-radio-group>
    `,
  }),
};
