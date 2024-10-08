import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { CheckboxComponent } from '../../src';

export const Color: AngularStoryObj<CheckboxComponent> = {
  name: 'Color',
  tags: ['uiComponentName:checkbox', 'uiComponentPropName:color'],
  parameters: {
    docs: {
      description: {
        story: 'Color options enable seamless integration with various themes or to highlight specific actions.',
      },
      source: {
        code: `<cck-checkbox [color]="..."></cck-checkbox>`,
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
        [headers]="uiComponentConfig?.checkbox.color?.values"
        [rowHeaders]="uiComponentConfig?.checkbox.type?.values ?? []">
        @for (type of uiComponentConfig?.checkbox.type?.values ?? [null]; let row = $index; track type) {
          @for (color of uiComponentConfig?.checkbox.color?.values; let col = $index; track color) {
            <story-table-cell [row]="row" [col]="col">
              <cck-checkbox [color]="color" [type]="type" [checked]="true">Checkbox Label</cck-checkbox>
            </story-table-cell>
          }
        }
      </story-table>     
    `,
  }),
};
