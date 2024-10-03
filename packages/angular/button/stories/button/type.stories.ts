import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { ButtonComponent } from '../../src/lib/button/button.component';

export const Type: AngularStoryObj<ButtonComponent> = {
  name: 'Type',
  tags: ['uiComponentName:button', 'uiComponentPropName:type'],
  parameters: {
    docs: {
      description: {
        story:
          'Displays variations in appearance and functionality, demonstrating how different types can be used to create unique button styles.',
      },
      source: {
        code: `<button cck-button [type]="..."></button>`,
      },
    },
  },
  render: (args) => ({
    props: {
      ...args,
      uiComponentConfig: getSelectedCckTheme()?.uiComponentConfig,
    },
    template: `
        @for (type of uiComponentConfig?.button.type?.values; track type) {
          <div class="flex-col flex-center gap-12">
            <button cck-button [type]="type">Button</button>
            <span class="p-sm-regular-2">{{type}}</span>
          </div>
        }
    `,
  }),
};
