import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { RadioButtonComponent } from '../../src';

export const Color: AngularStoryObj<RadioButtonComponent> = {
  name: 'Color',
  tags: ['uiBaseComponentName:radioButton', 'uiBaseComponentPropName:color'],
  parameters: {
    docs: {
      description: {
        story: 'Color options enable seamless integration with various themes or to highlight specific actions.',
      },
      source: {
        code: `
          <cck-radio-button [color]="..." [checked]="true" [value]="1">Radio Button</cck-radio-button>
        `,
      },
    },
  },
  render: (args) => ({
    props: {
      ...args,
      themeComponentConfig: getSelectedCckTheme()?.themeConfig.components,
    },
    template: `
      <story-table
        [headers]="themeComponentConfig?.radioButton.color?.values"
        [rowHeaders]="themeComponentConfig?.radioButton.type?.values ?? []">
        @for (type of themeComponentConfig?.radioButton.type?.values ?? [null]; let row = $index; track type) {
          @for (color of themeComponentConfig?.radioButton.color?.values; let col = $index; track color) {
            <story-table-cell [row]="row" [col]="col">
              <cck-radio-button [type]="type" [color]="color" [checked]="true" [value]="1">Radio Button</cck-radio-button>
            </story-table-cell>
          }
        }
      </story-table>  
    `,
  }),
};
