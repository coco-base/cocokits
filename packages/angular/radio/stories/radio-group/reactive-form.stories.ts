import { FormControl } from '@angular/forms';

import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { RadioButtonComponent } from '../../src';

export const ReactiveForm: AngularStoryObj<RadioButtonComponent> = {
  name: 'ReactiveForm',
  parameters: {
    docs: {
      description: {
        story: `Illustrates integration within Angular's Reactive Forms, focusing on form control, validation, and efficient state management.`,
      },
      source: {
        code: `
          <cck-radio-group [formControl]="control">
            <cck-radio-button [value]="1">Radio Button 1</cck-radio-button>
            <cck-radio-button [value]="2">Radio Button 2</cck-radio-button>
            <cck-radio-button [value]="3">Radio Button 3</cck-radio-button>
          </cck-radio-group>
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
      <story-columns>
        <story-column>
           <cck-radio-group [formControl]="control">
            <cck-radio-button [value]="1">Radio Button 1</cck-radio-button>
            <cck-radio-button [value]="2">Radio Button 2</cck-radio-button>
            <cck-radio-button [value]="3">Radio Button 3</cck-radio-button>
          </cck-radio-group>
        </story-column>
        
        <story-column>
        <div class="p-sm-regular-3">Control Value: {{control.value}}</div>
          <button class="story-button" (click)="control.reset()">Reset</button>
          <button class="story-button" (click)="control.setValue(1)">Select 1</button>
          <button class="story-button" (click)="control.setValue(2)">Select 2</button>
          <button class="story-button" (click)="control.setValue(3)">Select 3</button>
          <button class="story-button" (click)="control.disabled ? control.enable() : control.disable()">Toggle Disable</button>
        </story-column>
      </story-columns>
    `,
  }),
};
