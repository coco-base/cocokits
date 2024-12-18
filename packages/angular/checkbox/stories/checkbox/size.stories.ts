import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { CheckboxComponent } from '../../src';

export const Size: AngularStoryObj<CheckboxComponent> = {
  name: 'Size',
  tags: ['uiBaseComponentName:checkbox', 'uiBaseComponentPropName:size'],
  parameters: {
    docs: {
      description: {
        story:
          'The size is adjustable to suit different design needs and screen dimensions, improving both aesthetics and usability.',
      },
      source: {
        code: `<cck-checkbox [size]="..."></cck-checkbox>`,
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
        [headers]="themeComponentConfig?.checkbox.size?.values"
        [rowHeaders]="themeComponentConfig?.checkbox.type?.values ?? []">
        @for (type of themeComponentConfig?.checkbox.type?.values ?? [null]; let row = $index; track type) {
          @for (size of themeComponentConfig?.checkbox.size?.values; let col = $index; track size) {
            <story-table-cell [row]="row" [col]="col">
              <cck-checkbox [size]="size" [type]="type" [checked]="true">Checkbox Label</cck-checkbox>
            </story-table-cell>
          }
        }
      </story-table>     
    `,
  }),
};
