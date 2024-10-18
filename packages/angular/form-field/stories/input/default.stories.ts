import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { InputComponent } from '../../src/lib/input/input.component';

export const Default: AngularStoryObj<InputComponent> = {
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
            <cck-label>Label</cck-label>
            <input cckInput/>
          </cck-form-field>
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
        [headers]="['Default', 'Disabled']">
        <story-table-cell row="0" col="0">
          <cck-form-field>
            <cck-label>Label</cck-label>
            <input cckInput/>
          </cck-form-field>
        </story-table-cell>
        <story-table-cell row="0" col="1">
          <cck-form-field disabled="true">
            <cck-label>Label</cck-label>
            <input cckInput/>
          </cck-form-field>
        </story-table-cell>
      </story-table>
    `,
  }),
};
