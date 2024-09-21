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
      <table class="story-variant-table story-variant-table--no-col-header">
        <thead>
          <th>Default</th>
          <th>Disabled</th>
          <th>Disabled - Checked</th>
        </thead>
        <tbody>
          <tr>
            <td><cck-radio-button [value]="1">Radio Button</cck-radio-button></td>
            <td><cck-radio-button [disabled]="true" [value]="1">Radio Button</cck-radio-button></td>
            <td><cck-radio-button [disabled]="true" [checked]="true" [value]="1">Radio Button</cck-radio-button></td>
          </tr>
        </tbody>
      </table>
    `,
  }),
};
