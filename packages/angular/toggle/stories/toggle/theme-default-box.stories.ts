import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { ToggleComponent } from '../../src';

export const ThemeDefaultBox: AngularStoryObj<ToggleComponent> = {
  name: 'Theme Default: Box',
  tags: ['theme:default'],
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
      modelValue: true,
    },
    template: `
          <cck-toggle [(ngModel)]="modelValue" labelPosition="before" class="story-theme-default-toggle-box">
            <div class="flex-col">
              <span class="story-theme-default-toggle-box__title">Enable early access</span>
              <span class="story-theme-default-toggle-box__text">Get access to new features before they are released.</span>
            </div>
          </cck-toggle>
      
    `,
  }),
};
