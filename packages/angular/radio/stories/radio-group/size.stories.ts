import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { RadioButtonComponent } from '../../src';

export const Size: AngularStoryObj<RadioButtonComponent> = {
  name: 'Size',
  tags: ['uiComponentName:radioGroup', 'uiComponentPropName:size'],
  parameters: {
    docs: {
      description: {
        story:
          'The size is adjustable to suit different design needs and screen dimensions, improving both aesthetics and usability.',
      },
      source: {
        code: `
          <cck-radio-group [size]="..." [selected]="1">
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
      uiComponentConfig: getSelectedCckTheme()?.uiComponentConfig,
      types: getSelectedCckTheme()?.uiComponentConfig.radioGroup.type?.values.filter((type) => {
        return type !== 'row';
      }),
    },
    template: `
      <story-table
        [headers]="uiComponentConfig?.radioGroup.size?.values"
        [rowHeaders]="types ?? []"
        cellVAlign="start">
        @for (type of types ?? [null]; let row = $index; track type) {
          @for (size of uiComponentConfig?.radioGroup.size?.values; let col = $index; track size) {
            <story-table-cell [row]="row" [col]="col">
              <cck-radio-group [type]="type" [size]="size" [selected]="1">
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
