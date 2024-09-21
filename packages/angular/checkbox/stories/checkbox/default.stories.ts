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
      uiComponentConfig: getSelectedCckTheme()?.uiComponentConfig,
    },
    template: `
      <table class="story-variant-table story-variant-table--no-col-header">
        <thead>
          <th>Default</th>
          <th>Disabled</th>
          <th>Disabled - Checked</th>
        </thead>
        <tbody>
          <tr>
            <td><cck-checkbox>Checkbox Label</cck-checkbox></td>
            <td><cck-checkbox [disabled]="true">Checkbox Label</cck-checkbox></td>
            <td><cck-checkbox [disabled]="true" [checked]="true">Checkbox Label</cck-checkbox></td>
          </tr>
         
        </tbody>
      </table>
    `,
  }),
};
