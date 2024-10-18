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
          <cck-form-field>
            <cck-label>FormControl</cck-label>
            <cck-select [formControl]="controlSingle" [placeholder]="'Favorite food'">
              <cck-option>---</cck-option>
              <cck-option [value]="'Steak'">Steak</cck-option>
              <cck-option [value]="'Pizza'">Pizza</cck-option>
              <cck-option [value]="'Burger'">Burger</cck-option>
            </cck-select>
            
            @if(controlSingle.hasError() && controlSingle.errors?.required) {
              <cck-error>This field is required</cck-error>
            }
          </cck-form-field>
        `,
      },
    },
  },
  render: (args) => ({
    props: {
      ...args,
      uiComponentConfig: getSelectedCckTheme()?.uiComponentConfig,
      controlSingle: new FormControl('Burger', { validators: [Validators.required] }),
    },
    template: `
      <story-columns>
        <story-column>
          <cck-form-field class="story-w-200">
            <cck-label>FormControl</cck-label>
            <cck-select [formControl]="controlSingle" [placeholder]="'Favorite food'">
              <cck-option>---</cck-option>
              <cck-option [value]="'Steak'">Steak</cck-option>
              <cck-option [value]="'Pizza'">Pizza</cck-option>
              <cck-option [value]="'Burger'">Burger</cck-option>
            </cck-select>
            
            @if(controlSingle.hasError() && controlSingle.errors?.required) {
              <cck-error>This field is required</cck-error>
            }
          </cck-form-field>
        </story-column>
        
        <story-column>
          <div class="p-sm-regular-3">Control Value: {{controlSingle.value}}</div>
            <button class="story-button" (click)="controlSingle.setValue('Pizza')">Set Value to Pizza</button>
            <button class="story-button" (click)="controlSingle.reset()">Reset</button>
            <button class="story-button" (click)="controlSingle.disabled ? controlSingle.enable() : controlSingle.disable()">Toggle Disable</button>
        </story-column>
      </story-columns>
    `,
  }),
};
