import { FormControl, Validators } from '@angular/forms';

import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { InputComponent } from '../../src';

export const ReactiveForm: AngularStoryObj<InputComponent> = {
  name: 'ReactiveForm',
  parameters: {
    docs: {
      description: {
        story: `Illustrates integration within Angular's Reactive Forms, focusing on form control, validation, and efficient state management.`,
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
      controlSingle: new FormControl('Burger', { validators: [Validators.required] }),
      controlMulti: new FormControl(null, { validators: [Validators.required] }),
    },
    template: `
      <div class="flex-row w-100 justify-around">
      
        <div class="flex-col story-w-200">
          <div class="flex-col">
            <cck-form-field #formFieldSingle>
              <cck-label>FormControl Single</cck-label>
              <cck-select [formControl]="controlSingle" [placeholder]="'Select you food'">
                <cck-option>---</cck-option>
                <cck-option [value]="'Steak'">Steak</cck-option>
                <cck-option [value]="'Pizza'">Pizza</cck-option>
                <cck-option [value]="'Burger'">Burger</cck-option>
              </cck-select>
              
              @if(formFieldSingle.hasError() && controlSingle.errors?.required) {
                <cck-error>This field is required</cck-error>
              }
            </cck-form-field>
          </div>
          
          <div class="hr-v"></div>
          
          <div class="flex-col gap-24">
            <div class="p-sm-regular-3">Control Value: {{controlSingle.value}}</div>
            <button class="story-button" (click)="controlSingle.setValue('Pizza')">Set Value to Pizza</button>
            <button class="story-button" (click)="controlSingle.reset()">Reset</button>
            <button class="story-button" (click)="controlSingle.disabled ? controlSingle.enable() : controlSingle.disable()">Toggle Disable</button>
          </div>
        </div>
        
        <div class="flex-col story-w-200">
          <div class="flex-col">
            <cck-form-field #formFieldMulti>
              <cck-label>FormControl Multi</cck-label>
              <cck-select [multiple]="true" [formControl]="controlMulti" [placeholder]="'Select you food'">
                <cck-option [value]="'Steak'">Steak</cck-option>
                <cck-option [value]="'Pizza'">Pizza</cck-option>
                <cck-option [value]="'Burger'">Burger</cck-option>
              </cck-select>
              
              @if(formFieldMulti.hasError() && controlMulti.errors?.required) {
                <cck-error>This field is required</cck-error>
              }
            </cck-form-field>
          </div>
          
          <div class="hr-v"></div>
          
          <div class="flex-col gap-24">
            <div class="p-sm-regular-3">Control Value: {{controlMulti.value}}</div>
            <button class="story-button" (click)="controlMulti.setValue('Pizza')">Set Value to Pizza</button>
            <button class="story-button" (click)="controlMulti.reset()">Reset</button>
            <button class="story-button" (click)="controlMulti.disabled ? controlMulti.enable() : controlMulti.disable()">Toggle Disable</button>
          </div>
        </div>
      </div>
      
    `,
  }),
};
