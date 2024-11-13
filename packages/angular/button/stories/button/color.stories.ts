import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { ButtonComponent } from '../../src/lib/button/button.component';

export const Color: AngularStoryObj<ButtonComponent> = {
  name: 'Color',
  tags: ['uiBaseComponentName:button', 'uiBaseComponentPropName:color'],
  parameters: {
    docs: {
      description: {
        story: 'Color options enable seamless integration with various themes or to highlight specific actions.',
      },
      source: {
        code: `<button cck-button [color]="..."></button>`,
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
          ? getSelectedCckTheme()?.themeConfig.components.button?.type?.values
          : getSelectedCckTheme()?.themeConfig.components.button?.type?.values.filter((type) => type !== 'secondary'),
    },
    template: `
      <story-table
        [headers]="themeComponentConfig?.button.color?.values"
        [rowHeaders]="types ?? []">
        @for (type of types ?? [null]; let row = $index; track type) {
          @for (color of themeComponentConfig?.button.color?.values; let col = $index; track color) {
            <story-table-cell [row]="row" [col]="col">
              <button cck-button [type]="type" [color]="color">Button</button>
            </story-table-cell>
          }
        }
      </story-table>
    `,
  }),
};
