import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { ToggleComponent } from '../../src';

export const NgModel: AngularStoryObj<ToggleComponent> = {
  name: 'NgModel',
  parameters: {
    docs: {
      description: {
        story: `Demonstrates how to use Angular's NgModel for two-way data binding, enabling automatic synchronization between the UI element and the model.`,
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
      modelValue: true,
    },
    template: `
      <div class="flex-row w-100 justify-around">
      
        <div class="flex-col">
          <cck-toggle [(ngModel)]="modelValue"></cck-toggle>
        </div>
        
        <div class="hr-h"></div>
        
        <div class="flex-col gap-24 align-center">
          <div class="p-sm-regular-3">NgModel Value: {{modelValue}}</div>
          <button class="story-button" (click)="modelValue = false">Set To False</button>
          <button class="story-button" (click)="modelValue = true">Set To True</button>
        </div>
      </div>
      
    `,
  }),
};
