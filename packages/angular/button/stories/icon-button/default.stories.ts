import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { IconButtonComponent } from '../../src/lib/icon-button/icon-button.component';

export const Default: AngularStoryObj<IconButtonComponent> = {
  name: 'Default',
  parameters: {
    docs: {
      description: {
        story:
          'Shows the default example with no additional configurations, providing an interactive example in its most basic form.',
      },
      source: {
        code: `
          <button cck-icon-button>
            <cck-svg-icon [icon]="..."></cck-svg-icon>
          </button>`,
      },
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <story-table [headers]="['Default', 'Disabled']">
        <story-table-cell row="0" col="0">
          <button cck-icon-button>
            <cck-svg-icon [icon]="icon"></cck-svg-icon>
          </button>
        </story-table-cell>
        <story-table-cell row="0" col="1">
          <button cck-icon-button disabled>
            <cck-svg-icon [icon]="icon"></cck-svg-icon>
          </button>
        </story-table-cell>
      </story-table>
    `,
  }),
};
