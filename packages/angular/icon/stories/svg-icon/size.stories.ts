import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { SvgIconComponent } from '../../src';

export const Size: AngularStoryObj<SvgIconComponent> = {
  name: 'Size',
  tags: ['uiComponentName:svgIcon', 'uiComponentPropName:size'],
  parameters: {
    docs: {
      description: {
        story:
          'The size is adjustable to suit different design needs and screen dimensions, improving both aesthetics and usability.',
      },
      source: {
        code: `<cck-svg-icon [icon]="..." size="..."></cck-svg-icon>`,
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
        [headers]="uiComponentConfig?.svgIcon.size?.values"
        [rowHeaders]="uiComponentConfig?.svgIcon.type?.values ?? []">
        @for (type of uiComponentConfig?.svgIcon.type?.values ?? [null]; let row = $index; track type) {
          @for (size of uiComponentConfig?.svgIcon.size?.values; let col = $index; track size) {
            <story-table-cell [row]="row" [col]="col">
              <cck-svg-icon [icon]="icon" [size]="size" [type]="type"></cck-svg-icon>
            </story-table-cell>
          }
        }
      </story-table> 
    `,
  }),
};
