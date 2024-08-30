import { AngularStoryObj } from '@cocokits/core';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { ChipComponent } from '../../src/lib/chip/chip.component';

export const Size: AngularStoryObj<ChipComponent> = {
  name: 'Size',
  parameters: {
    docs: {
      description: {
        story: 'TODO: Add story description',
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
        <table class="story-variant-table story-variant-table--no-col-header">
        <thead>
           @for (size of uiComponentConfig?.chip.size?.values; track size) {
            <th>{{size}}</th>
          }
        </thead>
        <tbody>
          <tr>
           @for (size of uiComponentConfig?.chip.size?.values; track size) {
              <td>
                <cck-chip [size]="size">Chip Value</cck-chip>
              </td>
            }
          </tr>
        </tbody>
      </table>
    `,
  }),
};
