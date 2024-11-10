import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { ButtonComponent } from '../../src/lib/button/button.component';

export const Type: AngularStoryObj<ButtonComponent> = {
  name: 'Type',
  tags: ['uiBaseComponentName:button', 'uiBaseComponentPropName:type'],
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
      themeComponentConfig: getSelectedCckTheme()?.themeConfig.components,
    },
    template: `
      <story-table
        [headers]="themeComponentConfig?.button.type?.values">
        @for (type of themeComponentConfig?.button.type?.values; let i = $index; track type) {
          <story-table-cell row="0" [col]="i">
            <button cck-button [type]="type">Button</button>
          </story-table-cell>
        }
      </story-table>
    `,
  }),
};
