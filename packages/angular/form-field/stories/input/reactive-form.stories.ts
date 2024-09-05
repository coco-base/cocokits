import { FormControl, Validators } from '@angular/forms';

import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { InputComponent } from '../../src';

export const ReactiveForm: AngularStoryObj<InputComponent> = {
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
      control: new FormControl('Default Value', { validators: [Validators.required] }),
    },
    template: `
      <div class="flex-row w-100 justify-around">
      
        <div class="flex-col">
        <cck-form-field>
          <cck-label>FormControl</cck-label>  
          <input cckInput [formControl]="control"/>
          @if(control.errors?.required) {
            <cck-error>This field is required</cck-error>
          }
        </cck-form-field>
        </div>
        
        <div class="hr-h"></div>
        
        <div class="flex-col gap-24 align-center">
          <div class="p-sm-regular-3">Control Value: {{control.value}}</div>
          <button class="story-button" (click)="control.setValue('Default')">Set Value to Default</button>
          <button class="story-button" (click)="control.reset()">Reset</button>
          <button class="story-button" (click)="control.disabled ? control.enable() : control.disable()">Toggle Disable</button>
        </div>
      </div>
      
    `,
  }),
};
