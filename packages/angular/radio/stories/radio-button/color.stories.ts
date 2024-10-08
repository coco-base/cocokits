import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { RadioButtonComponent } from '../../src';

export const Color: AngularStoryObj<RadioButtonComponent> = {
  name: 'Color',
  tags: ['uiComponentName:radioButton', 'uiComponentPropName:color'],
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
    },
    template: `
      <story-table
        [headers]="uiComponentConfig?.radioButton.color?.values"
        [rowHeaders]="uiComponentConfig?.radioButton.type?.values ?? []">
        @for (type of uiComponentConfig?.radioButton.type?.values ?? [null]; let row = $index; track type) {
          @for (color of uiComponentConfig?.radioButton.color?.values; let col = $index; track color) {
            <story-table-cell [row]="row" [col]="col">
              <cck-radio-button [type]="type" [color]="color" [checked]="true" [value]="1">Radio Button</cck-radio-button>
            </story-table-cell>
          }
        }
      </story-table>  
    `,
  }),
};
