import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { RadioButtonComponent } from '../../src';

export const Color: AngularStoryObj<RadioButtonComponent> = {
  name: 'Color',
  tags: ['uiComponentName:radioGroup', 'uiComponentPropName:color'],
  parameters: {
    docs: {
      description: {
        story: 'Color options enable seamless integration with various themes or to highlight specific actions.',
      },
      source: {
        code: `TODO: ...`,
      },
    },
  },
  render: (args) => ({
    props: {
      ...args,
      uiComponentConfig: getSelectedCckTheme()?.uiComponentConfig,
      types: getSelectedCckTheme()?.uiComponentConfig.radioGroup.type?.values.filter((type) => {
        return type !== 'row';
      }),
    },
    template: `

      <story-table
        [headers]="uiComponentConfig?.radioGroup.color?.values"
        [rowHeaders]="types ?? []">
        @for (type of types ?? [null]; let row = $index; track type) {
          @for (color of uiComponentConfig?.radioGroup.color?.values; let col = $index; track color) {
            <story-table-cell [row]="row" [col]="col">
              <cck-radio-group [type]="type" [color]="color" [selected]="1">
                <cck-radio-button [value]="1">Radio Button 1</cck-radio-button>
                <cck-radio-button [value]="2">Radio Button 2</cck-radio-button>
                <cck-radio-button [value]="3">Radio Button 3</cck-radio-button>
              </cck-radio-group>
            </story-table-cell>
          }
        }
      </story-table>  
    `,
  }),
};
