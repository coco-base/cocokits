import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { ButtonComponent } from '../../src/lib/button/button.component';

export const Size: AngularStoryObj<ButtonComponent> = {
  name: 'Size',
  tags: ['uiComponentName:button', 'uiComponentPropName:size'],
  parameters: {
    docs: {
      description: {
        story:
          'The size is adjustable to suit different design needs and screen dimensions, improving both aesthetics and usability.',
      },
      source: {
        code: `<button cck-button [size]="..."></button>`,
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
        [headers]="uiComponentConfig?.button.size?.values"
        [rowHeaders]="uiComponentConfig?.button.type?.values">
        @for (type of uiComponentConfig?.button.type?.values; let row = $index; track type) {
          @for (size of uiComponentConfig?.button.size?.values; let col = $index; track size) {
            <story-table-cell [row]="row" [col]="col">
              <button cck-button [type]="type" [size]="size">Button</button>
            </story-table-cell>
          }
        }
      </story-table>
    `,
  }),
};
