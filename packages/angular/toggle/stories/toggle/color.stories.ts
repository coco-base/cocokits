import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { ToggleComponent } from '../../src/lib/toggle/toggle.component';

export const Color: AngularStoryObj<ToggleComponent> = {
  name: 'Color',
  tags: ['uiComponentName:toggle', 'uiComponentPropName:color'],
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
      uiComponentConfig: getSelectedCckTheme()?.uiComponentConfig,
    },
    template: `
      <story-table
        [headers]="uiComponentConfig?.toggle.color?.values"
        [rowHeaders]="uiComponentConfig?.toggle.type?.values ?? []">
        @for (type of uiComponentConfig?.toggle.type?.values ?? [null]; let row = $index; track type) {
          @for (color of uiComponentConfig?.toggle.color?.values; let col = $index; track color) {
            <story-table-cell [row]="row" [col]="col">
              <cck-toggle checked="true" [color]="color" [type]="type"></cck-toggle>
            </story-table-cell>
          }
        }
      </story-table>  
    `,
  }),
};
