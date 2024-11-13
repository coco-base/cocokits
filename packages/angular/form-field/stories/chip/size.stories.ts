import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { ChipComponent } from '../../src/lib/chip/chip.component';

export const Size: AngularStoryObj<ChipComponent> = {
  name: 'Size',
  tags: ['uiBaseComponentName:chip', 'uiBaseComponentPropName:size'],
  parameters: {
    docs: {
      description: {
        story:
          'The size is adjustable to suit different design needs and screen dimensions, improving both aesthetics and usability.',
      },
      source: {
        code: `
          <cck-chip [size]="...">Chip Value</cck-chip>
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
        [headers]="themeComponentConfig?.chip?.size?.values"
        [rowHeaders]="themeComponentConfig?.chip?.type?.values ?? []">
        @for (type of themeComponentConfig?.chip?.type?.values ?? [null]; let row = $index; track type) {
          @for (size of themeComponentConfig?.chip?.size?.values; let col = $index; track size) {
            <story-table-cell [row]="row" [col]="col">
              <cck-chip [size]="size" [type]="type">Chip Value</cck-chip>
            </story-table-cell>
          }
        }
      </story-table>     
    `,
  }),
};
