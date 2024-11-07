import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { IconButtonComponent } from '../../src/lib/icon-button/icon-button.component';

export const ThemeCocokitsRoundedColor: AngularStoryObj<IconButtonComponent> = {
  name: 'Theme Cocokits: Rounded - Color',
  tags: ['theme:cocokits'],
  parameters: {
    docs: {
      description: {
        story: '',
      },
      source: {
        code: `
          <button cck-icon-button data-cck-rounded="true" [color]="...">
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
        [headers]="themeConfig?.iconButton.color?.values"
        [rowHeaders]="themeConfig?.iconButton.type?.values">
        @for (type of themeConfig?.iconButton.type?.values; let row = $index; track type) {
          @for (color of themeConfig?.iconButton.color?.values; let col = $index; track color) {
            <story-table-cell [row]="row" [col]="col">
              <button cck-icon-button data-cck-rounded="true" [type]="type" [color]="color">
                <cck-svg-icon [icon]="icon"></cck-svg-icon>
              </button>
            </story-table-cell>
          }
        }
      </story-table>
    `,
  }),
};
