import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { CheckboxComponent } from '../../src/lib/checkbox/checkbox.component';

export const Default: AngularStoryObj<CheckboxComponent> = {
  name: 'Default',
  parameters: {
    docs: {
      description: {
        story:
          'Shows the default example with no additional configurations, providing an interactive example in its most basic form.',
      },
      source: {
        code: `
          <cck-checkbox>Checkbox Label</cck-checkbox>
          <cck-checkbox [disabled]="true">Checkbox Label</cck-checkbox>
          <cck-checkbox [disabled]="true" [checked]="true">Checkbox Label</cck-checkbox>
        `,
      },
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <story-table
        [headers]="['Default', 'Disabled', 'Disabled - Checked']">
        <story-table-cell row="0" col="0">
          <cck-checkbox>Checkbox Label</cck-checkbox>
        </story-table-cell>
        <story-table-cell row="0" col="1">
          <cck-checkbox [disabled]="true">Checkbox Label</cck-checkbox>
        </story-table-cell>
        <story-table-cell row="0" col="2">
          <cck-checkbox [disabled]="true" [checked]="true">Checkbox Label</cck-checkbox>
        </story-table-cell>
      </story-table>
    `,
  }),
};
