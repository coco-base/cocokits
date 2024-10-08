import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { DividerComponent } from '../../src/lib/divider/divider.component';

export const Type: AngularStoryObj<DividerComponent> = {
  name: 'Type',
  tags: ['uiComponentName:divider', 'uiComponentPropName:type'],
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
      uiComponentConfig: getSelectedCckTheme()?.uiComponentConfig,
    },
    template: `
      <story-table
        [headers]="uiComponentConfig?.divider.type?.values"
        [cellHeight]="'100px'">
        @for (type of uiComponentConfig?.divider.type?.values; let i = $index; track type) {
          <story-table-cell row="0" [col]="i">
            <cck-divider [style.margin]="'0 auto'" [type]="type"></cck-divider>
          </story-table-cell>
        }
      </story-table>
    `,
  }),
};
