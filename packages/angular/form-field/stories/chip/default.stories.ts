import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { ChipComponent } from '../../src/lib/chip/chip.component';

export const Default: AngularStoryObj<ChipComponent> = {
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
          <th>Removable</th>
          <th>Disabled</th>
        </thead>
        <tbody>
          <tr>
              <td>
                <cck-chip>Default</cck-chip>
              </td>
              <td>
                <cck-chip [removable]="true">Removable</cck-chip>
              </td>
              <td>
                <cck-chip disabled="">Disabled</cck-chip>
              </td>
          </tr>
        </tbody>
      </table>
    `,
  }),
};
