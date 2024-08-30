import { AngularStoryObj } from '@cocokits/core';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { ChipListComponent } from '../../src/lib/chip-list/chip-list.component';

export const Size: AngularStoryObj<ChipListComponent<string>> = {
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
      chips: ['Steak', 'Pizza', 'Burger'],
    },
    template: `

      <table class="story-variant-table story-variant-table--center-header">
        <tbody>
          @for (size of uiComponentConfig?.chipList.size?.values; track size) {
            <tr>
              <td>{{size}}</td>
                <td>
                  <cck-form-field [size]="size">
                    <cck-label>Chip List</cck-label>
                    <cck-chip-list [chips]="chips" [placeholder]="'Add a new food'" [addOnBlur]="true">
                    </cck-chip-list>
                  </cck-form-field>
                </td>
            </tr>
          }
        </tbody>
      </table>
    `,
  }),
};
