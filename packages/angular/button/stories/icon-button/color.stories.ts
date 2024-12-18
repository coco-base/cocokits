import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { IconButtonComponent } from '../../src/lib/icon-button/icon-button.component';

export const Color: AngularStoryObj<IconButtonComponent> = {
  name: 'Color',
  tags: ['uiBaseComponentName:iconButton', 'uiBaseComponentPropName:color'],
  parameters: {
    docs: {
      description: {
        story: 'Color options enable seamless integration with various themes or to highlight specific actions.',
      },
      source: {
        code: `
          <button cck-icon-button [color]="...">
            <cck-svg-icon [icon]="..."></cck-svg-icon>
          </button>
        `,
      },
    },
  },
  render: (args) => ({
    props: {
      ...args,
      themeComponentConfig: getSelectedCckTheme()?.themeConfig.components,
      themeName: getSelectedCckTheme()?.name,
      types:
        getSelectedCckTheme()?.id === 'cocokits'
          ? getSelectedCckTheme()?.themeConfig.components.iconButton.type?.values
          : getSelectedCckTheme()?.themeConfig.components.iconButton.type?.values.filter(
              (type) => type !== 'secondary'
            ),
    },
    template: `
      <story-table
        [headers]="themeComponentConfig?.iconButton.color?.values"
        [rowHeaders]="types ?? []">
        @for (type of types ?? [null]; let row = $index; track type) {
          @for (color of themeComponentConfig?.iconButton.color?.values; let col = $index; track color) {
            <story-table-cell [row]="row" [col]="col">
              <button cck-icon-button [type]="type" [color]="color">
                <cck-svg-icon [icon]="icon"></cck-svg-icon>
              </button>
            </story-table-cell>
          }
        }
      </story-table>
    `,
  }),
};
