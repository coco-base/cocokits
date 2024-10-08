import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { ChipComponent } from '../../src/lib/chip/chip.component';

export const Size: AngularStoryObj<ChipComponent> = {
  name: 'Size',
  tags: ['uiComponentName:chip', 'uiComponentPropName:size'],
  parameters: {
    docs: {
      description: {
        story:
          'The size is adjustable to suit different design needs and screen dimensions, improving both aesthetics and usability.',
      },
      source: {
        code: `TODO: Add source code of story`,
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
        [headers]="uiComponentConfig?.chip.size?.values"
        [rowHeaders]="uiComponentConfig?.chip.type?.values ?? []">
        @for (type of uiComponentConfig?.chip.type?.values ?? [null]; let row = $index; track type) {
          @for (size of uiComponentConfig?.chip.size?.values; let col = $index; track size) {
            <story-table-cell [row]="row" [col]="col">
              <cck-chip [size]="size" [type]="type">Chip Value</cck-chip>
            </story-table-cell>
          }
        }
      </story-table>     
    `,
  }),
};
