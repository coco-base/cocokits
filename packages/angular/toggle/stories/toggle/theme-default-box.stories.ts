import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { ToggleComponent } from '../../src';

export const ThemeDefaultBox: AngularStoryObj<ToggleComponent> = {
  name: 'Theme Default: Box',
  tags: ['theme:default'],
  parameters: {
    docs: {
      description: {
        story:
          'An advanced example of the toggle component featuring a custom implementation and design that incorporates toggle functionality within box selections, enhancing interactivity and visual presentation.',
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
