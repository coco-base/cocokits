import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { RadioButtonComponent } from '../../src';

export const NgModel: AngularStoryObj<RadioButtonComponent> = {
  name: 'NgModel',
  parameters: {
    docs: {
      description: {
        story: `Demonstrates how to use Angular's NgModel for two-way data binding, enabling automatic synchronization between the UI element and the model.`,
      },
      source: {
        code: `
          <cck-radio-group [(ngModel)]="modelValue">
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
      modelValue: null,
    },
    template: `
      <story-columns>
        <story-column>
           <cck-radio-group [(ngModel)]="modelValue">
            <cck-radio-button [value]="1">Radio Button 1</cck-radio-button>
            <cck-radio-button [value]="2">Radio Button 2</cck-radio-button>
            <cck-radio-button [value]="3">Radio Button 3</cck-radio-button>
          </cck-radio-group>
        </story-column>
        
        <story-column>
          <div class="p-sm-regular-3">NgModel Value: {{modelValue}}</div>
          <button class="story-button" (click)="modelValue = null">Reset</button>
          <button class="story-button" (click)="modelValue = 1">Select 1</button>
          <button class="story-button" (click)="modelValue = 2">Select 2</button>
          <button class="story-button" (click)="modelValue = 3">Select 3</button>
        </story-column>
      </story-columns>
    `,
  }),
};
