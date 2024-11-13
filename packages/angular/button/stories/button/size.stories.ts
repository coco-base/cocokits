import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { ButtonComponent } from '../../src/lib/button/button.component';

export const Size: AngularStoryObj<ButtonComponent> = {
  name: 'Size',
  tags: ['uiBaseComponentName:button', 'uiBaseComponentPropName:size'],
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
      themeComponentConfig: getSelectedCckTheme()?.themeConfig.components,
    },
    template: `
      <story-table
        [headers]="themeComponentConfig?.button?.size?.values"
        [rowHeaders]="themeComponentConfig?.button?.type?.values">
        @for (type of themeComponentConfig?.button?.type?.values; let row = $index; track type) {
          @for (size of themeComponentConfig?.button?.size?.values; let col = $index; track size) {
            <story-table-cell [row]="row" [col]="col">
              <button cck-button [type]="type" [size]="size">Button</button>
            </story-table-cell>
          }
        }
      </story-table>
    `,
  }),
};
