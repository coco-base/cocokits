import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { ToggleComponent } from '../../src/lib/toggle/toggle.component';

export const Type: AngularStoryObj<ToggleComponent> = {
  name: 'Type',
  tags: ['uiBaseComponentName:toggle', 'uiBaseComponentPropName:type'],
  parameters: {
    docs: {
      description: {
        story:
          'Displays variations in appearance and functionality, demonstrating how different types can be used to create unique button styles.',
      },
      source: {
        code: `TODO: Add source code of story`,
      },
    },
  },
  render: (args) => ({
    props: {
      ...args,
      themeConfig: getSelectedCckTheme()?.themeConfig,
    },
    template: `
      <story-table
        [headers]="themeConfig?.toggle.type?.values">
        @for (type of themeConfig?.toggle.type?.values; let i = $index; track type) {
          <story-table-cell row="0" [col]="i">
            <cck-toggle [type]="type"></cck-toggle>
          </story-table-cell>
        }
      </story-table>
    `,
  }),
};
