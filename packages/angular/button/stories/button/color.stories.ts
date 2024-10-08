import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { ButtonComponent } from '../../src/lib/button/button.component';

export const Color: AngularStoryObj<ButtonComponent> = {
  name: 'Color',
  tags: ['uiComponentName:button', 'uiComponentPropName:color'],
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
      uiComponentConfig: getSelectedCckTheme()?.uiComponentConfig,
      themeName: getSelectedCckTheme()?.name,
      types:
        getSelectedCckTheme()?.id === 'cocokits'
          ? getSelectedCckTheme()?.uiComponentConfig.button.type?.values
          : getSelectedCckTheme()?.uiComponentConfig.button.type?.values.filter((type) => type !== 'secondary'),
    },
    template: `
      <story-table
        [headers]="uiComponentConfig?.button.color?.values"
        [rowHeaders]="types ?? []">
        @for (type of types ?? [null]; let row = $index; track type) {
          @for (color of uiComponentConfig?.button.color?.values; let col = $index; track color) {
            <story-table-cell [row]="row" [col]="col">
              <button cck-button [type]="type" [color]="color">Button</button>
            </story-table-cell>
          }
        }
      </story-table>
    `,
  }),
};
