import { AngularStoryObj } from '@cocokits/core';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { RadioButtonComponent } from '../../src';

export const NgModel: AngularStoryObj<RadioButtonComponent> = {
  name: 'NgModel',
  parameters: {
    docs: {
      description: {
        story: 'TODO: Add story description',
      },
      source: {
        code: `
          TODO: ...
        `,
      },
    },
  },
  render: (args) => ({
    props: {
      ...args,
      uiComponentConfig: getSelectedCckTheme()?.uiComponentConfig,
      modelValue: null,
    },
    template: `
      <div class="flex-row w-100 justify-around">
      
        <div class="flex-col">
          <cck-radio-group [(ngModel)]="modelValue">
            <cck-radio-button [value]="1">Radio Button 1</cck-radio-button>
            <cck-radio-button [value]="2">Radio Button 2</cck-radio-button>
            <cck-radio-button [value]="3">Radio Button 3</cck-radio-button>
          </cck-radio-group>
        </div>
        
        <div class="hr-h"></div>
        
        <div class="flex-col gap-24 align-center">
          <div class="p-sm-regular-3">NgModel Value: {{modelValue}}</div>
          <button class="story-button" (click)="modelValue = null">Reset</button>
          <button class="story-button" (click)="modelValue = 1">Select 1</button>
          <button class="story-button" (click)="modelValue = 2">Select 2</button>
          <button class="story-button" (click)="modelValue = 3">Select 3</button>
        </div>
      </div>
      
    `,
  }),
};
