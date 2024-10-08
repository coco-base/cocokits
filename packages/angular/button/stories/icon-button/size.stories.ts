import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { IconButtonComponent } from '../../src/lib/icon-button/icon-button.component';

export const Size: AngularStoryObj<IconButtonComponent> = {
  name: 'Size',
  tags: ['uiComponentName:iconButton', 'uiComponentPropName:size'],
  parameters: {
    docs: {
      description: {
        story:
          'The size is adjustable to suit different design needs and screen dimensions, improving both aesthetics and usability.',
      },
      source: {
        code: `
        <button cck-icon-button [size]="...">
          <cck-svg-icon [icon]="..."></cck-svg-icon>
        </button>
        `,
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
        [headers]="uiComponentConfig?.iconButton.size?.values"
        [rowHeaders]="uiComponentConfig?.iconButton.type?.values">
        @for (type of uiComponentConfig?.iconButton.type?.values; let row = $index; track type) {
          @for (size of uiComponentConfig?.iconButton.size?.values; let col = $index; track size) {
            <story-table-cell [row]="row" [col]="col">
              <button cck-icon-button [type]="type" [size]="size">
                <cck-svg-icon [icon]="icon"></cck-svg-icon>
              </button>
            </story-table-cell>
          }
        }
      </story-table>
    `,
  }),
};
