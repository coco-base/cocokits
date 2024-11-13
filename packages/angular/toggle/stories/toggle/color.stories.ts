import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { ToggleComponent } from '../../src/lib/toggle/toggle.component';

export const Color: AngularStoryObj<ToggleComponent> = {
  name: 'Color',
  tags: ['uiBaseComponentName:toggle', 'uiBaseComponentPropName:color'],
  parameters: {
    docs: {
      description: {
        story: 'Color options enable seamless integration with various themes or to highlight specific actions.',
      },
      source: {
        code: `
          <cck-toggle [checked]="true" [color]="...">Slide me!</cck-toggle>
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
        [headers]="themeConfig?.toggle?.color?.values"
        [rowHeaders]="themeConfig?.toggle?.type?.values ?? []">
        @for (type of themeConfig?.toggle?.type?.values ?? [null]; let row = $index; track type) {
          @for (color of themeConfig?.toggle?.color?.values; let col = $index; track color) {
            <story-table-cell [row]="row" [col]="col">
              <cck-toggle checked="true" [color]="color" [type]="type"></cck-toggle>
            </story-table-cell>
          }
        }
      </story-table>  
    `,
  }),
};
