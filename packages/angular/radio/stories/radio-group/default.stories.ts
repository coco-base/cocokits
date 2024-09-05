import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { RadioButtonComponent } from '../../src/lib/radio/radio.component';

export const Default: AngularStoryObj<RadioButtonComponent> = {
  name: 'Default',
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
          <th>Default</th>
          <th>Disabled</th>
          <th>Disabled - Checked</th>
          <th>Disabled - Partial</th>
        </thead>
        <tbody>
          <tr>
            <td>
              <cck-radio-group>
                <cck-radio-button [value]="1">Radio Button 1</cck-radio-button>
                <cck-radio-button [value]="2">Radio Button 2</cck-radio-button>
                <cck-radio-button [value]="3">Radio Button 3</cck-radio-button>
              </cck-radio-group>
            </td>
            <td>
              <cck-radio-group [disabled]="true">
                <cck-radio-button [value]="1">Radio Button 1</cck-radio-button>
                <cck-radio-button [value]="2">Radio Button 2</cck-radio-button>
                <cck-radio-button [value]="3">Radio Button 3</cck-radio-button>
              </cck-radio-group>
            </td>
            <td>
              <cck-radio-group [disabled]="true" [selected]="1">
                <cck-radio-button [value]="1">Radio Button 1</cck-radio-button>
                <cck-radio-button [value]="2">Radio Button 2</cck-radio-button>
                <cck-radio-button [value]="3">Radio Button 3</cck-radio-button>
              </cck-radio-group>
            </td>
            <td>
              <cck-radio-group [selected]="1">
                <cck-radio-button [value]="1">Radio Button 1</cck-radio-button>
                <cck-radio-button [value]="2" [disabled]="true">Radio Button 2</cck-radio-button>
                <cck-radio-button [value]="3">Radio Button 3</cck-radio-button>
              </cck-radio-group>
            </td>
          </tr>
        </tbody>
      </table>
    `,
  }),
};
