import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { ChipComponent } from '../../src/lib/chip/chip.component';

export const Default: AngularStoryObj<ChipComponent> = {
  name: 'Default',
  parameters: {
    docs: {
      description: {
        story:
          'Shows the default example with no additional configurations, providing an interactive example in its most basic form.',
      },
      source: {
        code: `
          <cck-chip>Default</cck-chip>
          <cck-chip [removable]="true">Removable</cck-chip>
          <cck-chip disabled="">Disabled</cck-chip>
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
        [headers]="['Default', 'Removable', 'Disabled']">
        <story-table-cell row="0" col="0">
          <cck-chip>Default</cck-chip>
        </story-table-cell>
        <story-table-cell row="0" col="1">
          <cck-chip [removable]="true">Removable</cck-chip>
        </story-table-cell>
        <story-table-cell row="0" col="2">
          <cck-chip disabled="">Disabled</cck-chip>
        </story-table-cell>
      </story-table>
    `,
  }),
};
