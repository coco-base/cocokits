import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { InputComponent } from '../../src';

export const NgModel: AngularStoryObj<InputComponent> = {
  name: 'NgModel',
  parameters: {
    docs: {
      description: {
        story: `Demonstrates how to use Angular's NgModel for two-way data binding, enabling automatic synchronization between the UI element and the model.`,
      },
      source: {
        code: `
          <cck-form-field>
            <cck-label>ngModel</cck-label>
            <input cckInput [(ngModel)]="modelValue"/>
          </cck-form-field>
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
      <story-columns>
        <story-column>
          <cck-form-field>
            <cck-label>ngModel</cck-label>
            <input cckInput [(ngModel)]="modelValue"/>
          </cck-form-field>
        </story-column>
        
        <story-column>
          <div class="p-sm-regular-3">NgModel Value: {{modelValue}}</div>
          <input class="story-input" [(ngModel)]="modelValue"/>
        </story-column>
      </story-columns>
    `,
  }),
};
