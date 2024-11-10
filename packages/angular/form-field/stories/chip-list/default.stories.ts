import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { ChipListComponent } from '../../src/lib/chip-list/chip-list.component';

export const Default: AngularStoryObj<ChipListComponent<string>> = {
  name: 'Default',
  parameters: {
    docs: {
      description: {
        story:
          'Shows the default example with no additional configurations, providing an interactive example in its most basic form.',
      },
      source: {
        code: `
          <cck-form-field>
            <cck-label>Chip List</cck-label>
            <cck-chip-list [chips]="['Steak', 'Pizza', 'Burger']" [placeholder]="'Add a new food'">
            </cck-chip-list>
          </cck-form-field>
        `,
      },
    },
  },
  render: (args) => ({
    props: {
      ...args,
      chips: ['Steak', 'Pizza', 'Burger'],
    },
    template: `
        <cck-form-field class="story-w-600">
          <cck-label>Chip List</cck-label>
          <cck-chip-list [chips]="chips" [placeholder]="'Add a new food'" [addOnBlur]="true">
          </cck-chip-list>
        </cck-form-field>
    `,
  }),
};
