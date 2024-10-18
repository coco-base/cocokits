import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { RadioButtonComponent } from '../../src';

export const Size: AngularStoryObj<RadioButtonComponent> = {
  name: 'Size',
  tags: ['uiComponentName:radioButton', 'uiComponentPropName:size'],
  parameters: {
    docs: {
      description: {
        story:
          'The size is adjustable to suit different design needs and screen dimensions, improving both aesthetics and usability.',
      },
      source: {
        code: `
          <cck-radio-button [size]="..." [checked]="true" [value]="1">Radio Button</cck-radio-button>
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
        [headers]="uiComponentConfig?.radioButton.size?.values"
        [rowHeaders]="uiComponentConfig?.radioButton.type?.values ?? []">
        @for (type of uiComponentConfig?.radioButton.type?.values ?? [null]; let row = $index; track type) {
          @for (size of uiComponentConfig?.radioButton.size?.values; let col = $index; track size) {
            <story-table-cell [row]="row" [col]="col">
              <cck-radio-button [type]="type" [size]="size" [value]="1" [checked]="true">Radio Button</cck-radio-button>
            </story-table-cell>
          }
        }
      </story-table>  
    `,
  }),
};
