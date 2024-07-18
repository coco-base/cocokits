import { AngularStoryObj } from '@cocokits/core';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { CheckboxComponent } from '../../src/lib/checkbox/checkbox.component';

export const Default: AngularStoryObj<CheckboxComponent> = {
  name: 'Default',
  parameters: {
    docs: {
      description: {
        story: 'TODO: Add story description',
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
