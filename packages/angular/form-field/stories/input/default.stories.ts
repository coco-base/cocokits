import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { InputComponent } from '../../src/lib/input/input.component';

export const Default: AngularStoryObj<InputComponent> = {
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
        </thead>
        <tbody>
          <tr>
              <td>
                <cck-form-field>
                  <cck-label>Label</cck-label>
                  <input cckInput/>
                </cck-form-field>
              </td>
              
              <td>
                <cck-form-field disabled="true">
                  <cck-label>Label</cck-label>
                  <input cckInput/>
                </cck-form-field>
              </td>
          </tr>
        </tbody>
      </table>
    `,
  }),
};
