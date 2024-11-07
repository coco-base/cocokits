import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { IconButtonComponent } from '../../src/lib/icon-button/icon-button.component';

export const ThemeCocokitsRoundedSize: AngularStoryObj<IconButtonComponent> = {
  name: 'Theme Cocokits: Rounded - Size',
  tags: ['theme:cocokits'],
  parameters: {
    docs: {
      description: {
        story: '',
      },
      source: {
        code: `
          <button cck-icon-button data-cck-rounded="true" [size]="...">
            <cck-svg-icon [icon]="..."></cck-svg-icon>
          </button>
        `,
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
        [headers]="themeConfig?.iconButton.size?.values"
        [rowHeaders]="themeConfig?.iconButton.type?.values">
        @for (type of themeConfig?.iconButton.type?.values; let row = $index; track type) {
          @for (size of themeConfig?.iconButton.size?.values; let col = $index; track size) {
            <story-table-cell [row]="row" [col]="col">
              <button cck-icon-button data-cck-rounded="true" [type]="type" [size]="size">
                <cck-svg-icon [icon]="icon"></cck-svg-icon>
              </button>
            </story-table-cell>
          }
        }
      </story-table>
    `,
  }),
};
