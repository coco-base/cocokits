import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { RadioButtonComponent } from '../../src';

export const Color: AngularStoryObj<RadioButtonComponent> = {
  name: 'Color',
  tags: ['uiBaseComponentName:radioGroup', 'uiBaseComponentPropName:color'],
  parameters: {
    docs: {
      description: {
        story: 'Color options enable seamless integration with various themes or to highlight specific actions.',
      },
      source: {
        code: `
          <cck-radio-group [color]="..." [selected]="1">
            <cck-radio-button [value]="1">Radio Button 1</cck-radio-button>
            <cck-radio-button [value]="2">Radio Button 2</cck-radio-button>
            <cck-radio-button [value]="3">Radio Button 3</cck-radio-button>
          </cck-radio-group>
        `,
      },
    },
  },
  render: (args) => ({
    props: {
      ...args,
      themeComponentConfig: getSelectedCckTheme()?.themeConfig.components,
      types: getSelectedCckTheme()?.themeConfig.components.radioGroup.type?.values.filter((type) => {
        return type !== 'row';
      }),
    },
    template: `

      <story-table
        [headers]="themeComponentConfig?.radioGroup.color?.values"
        [rowHeaders]="types ?? []">
        @for (type of types ?? [null]; let row = $index; track type) {
          @for (color of themeComponentConfig?.radioGroup.color?.values; let col = $index; track color) {
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
