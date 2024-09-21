import { FormControl } from '@angular/forms';

import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { CheckboxComponent } from '../../src/lib/checkbox/checkbox.component';

export const ReactiveForm: AngularStoryObj<CheckboxComponent> = {
  name: 'ReactiveForm',
  parameters: {
    docs: {
      description: {
        story: `Illustrates integration within Angular's Reactive Forms, focusing on form control, validation, and efficient state management.`,
      },
      source: {
        code: `
          <cck-checkbox [formControl]="control">Checkbox Label</cck-checkbox>
        `,
      },
    },
  },
  render: (args) => ({
    props: {
      ...args,
      uiComponentConfig: getSelectedCckTheme()?.uiComponentConfig,
      control: new FormControl(false),
    },
    template: `
      <div class="flex-row w-100 justify-around">
      
        <div class="flex-col">
          <cck-checkbox [formControl]="control">Checkbox Label</cck-checkbox>
        </div>
        
        <div class="hr-h"></div>
        
        <div class="flex-col gap-24 align-center">
          <div class="p-sm-regular-3">Control Value: {{control.value}}</div>
          <button class="story-button" (click)="control.reset()">Reset</button>
          <button class="story-button" (click)="control.setValue(true)">Set to true</button>
          <button class="story-button" (click)="control.setValue(false)">Set to false</button>
          <button class="story-button" (click)="control.disabled ? control.enable() : control.disable()">Toggle Disable</button>
        </div>
      </div>
      
    `,
  }),
};
