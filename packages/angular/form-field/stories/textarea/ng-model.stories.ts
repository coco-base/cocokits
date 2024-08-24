import { AngularStoryObj } from '@cocokits/core';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { InputComponent } from '../../src';

export const NgModel: AngularStoryObj<InputComponent> = {
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
      modelValue: 'Default Value',
    },
    template: `
      <div class="flex-row w-100 justify-around">
      
        <div class="flex-col">
          <cck-form-field>
            <cck-label>ngModel</cck-label>
            <textarea cckTextarea [(ngModel)]="modelValue"></textarea>
          </cck-form-field>
        </div>
        
        <div class="hr-h"></div>
        
        <div class="flex-col gap-24 align-center">
          <div class="p-sm-regular-3">NgModel Value: {{modelValue}}</div>
          <textarea class="story-input" [(ngModel)]="modelValue" style="resize: none;"></textarea>
        </div>
      </div>
      
    `,
  }),
};
