import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { CheckboxComponent } from '../../src/lib/checkbox/checkbox.component';

export const NgModel: AngularStoryObj<CheckboxComponent> = {
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
      modelValue: false,
    },
    template: `
      <div class="flex-row w-100 justify-around">
      
        <div class="flex-col">
          <cck-checkbox [(ngModel)]="modelValue">Checkbox Label</cck-checkbox>
        </div>
        
        <div class="hr-h"></div>
        
        <div class="flex-col gap-24 align-center">
          <div class="p-sm-regular-3">NgModel Value: {{modelValue}}</div>
          <button class="story-button" (click)="modelValue = null">Reset</button>
          <button class="story-button" (click)="modelValue = true">Set to true</button>
          <button class="story-button" (click)="modelValue = false">Set to false</button>
        </div>
      </div>
      
    `,
  }),
};
