import { FormControl } from '@angular/forms';

import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { RadioButtonComponent } from '../../src';

export const ReactiveForm: AngularStoryObj<RadioButtonComponent> = {
  name: 'ReactiveForm',
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
      control: new FormControl(),
    },
    template: `
      <div class="flex-row w-100 justify-around">
      
        <div class="flex-col">
          <cck-radio-group [formControl]="control">
            <cck-radio-button [value]="1">Radio Button 1</cck-radio-button>
            <cck-radio-button [value]="2">Radio Button 2</cck-radio-button>
            <cck-radio-button [value]="3">Radio Button 3</cck-radio-button>
          </cck-radio-group>
        </div>
        
        <div class="hr-h"></div>
        
        <div class="flex-col gap-24 align-center">
          <div class="p-sm-regular-3">Control Value: {{control.value}}</div>
          <button class="story-button" (click)="control.reset()">Reset</button>
          <button class="story-button" (click)="control.setValue(1)">Select 1</button>
          <button class="story-button" (click)="control.setValue(2)">Select 2</button>
          <button class="story-button" (click)="control.setValue(3)">Select 3</button>
          <button class="story-button" (click)="control.disabled ? control.enable() : control.disable()">Toggle Disable</button>
        </div>
      </div>
      
    `,
  }),
};
