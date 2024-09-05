import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { ToggleComponent } from '../../src/lib/toggle/toggle.component';

export const Default: AngularStoryObj<ToggleComponent> = {
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
        <table class="story-variant-table story-variant-table--no-col-header story-variant-table--bottom-align">
        <thead>
          <th>Default</th>
          <th>Label Before</th>
          <th>Disabled</th>
        </thead>
        <tbody>
          <tr>
              <td>
                <cck-toggle checked="true">Slide me!</cck-toggle>
              </td>
              <td>
                <cck-toggle checked="true" [labelPosition]="'before'">Slide me!</cck-toggle>
              </td>
              <td>
                <cck-toggle checked="true" disabled="true">Slide me!</cck-toggle>
              </td>
          </tr>
        </tbody>
      </table>
    `,
  }),
};
