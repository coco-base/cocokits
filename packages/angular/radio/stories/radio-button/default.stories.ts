import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { RadioButtonComponent } from '../../src/lib/radio/radio.component';

export const Default: AngularStoryObj<RadioButtonComponent> = {
  name: 'Default',
  parameters: {
    docs: {
      description: {
        story:
          'Shows the default example with no additional configurations, providing an interactive example in its most basic form.',
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
        [headers]="['Default', 'Disabled', 'Disabled - Checked']">
        <story-table-cell row="0" col="0">
          <cck-radio-button [value]="1">Radio Button</cck-radio-button>
        </story-table-cell>
        <story-table-cell row="0" col="1">
          <cck-radio-button [disabled]="true" [value]="1">Radio Button</cck-radio-button>
        </story-table-cell>
        <story-table-cell row="0" col="2">
          <cck-radio-button [disabled]="true" [value]="1" [checked]="true">Radio Button</cck-radio-button>
        </story-table-cell>
      </story-table>
    `,
  }),
};
