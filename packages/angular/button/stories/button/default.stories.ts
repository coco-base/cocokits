import { AngularStoryObj } from '@cocokits/internal-model';

import { ButtonComponent } from '../../src/lib/button/button.component';

export const Default: AngularStoryObj<ButtonComponent> = {
  name: 'Default',
  parameters: {
    docs: {
      description: {
        story:
          'Shows the default example with no additional configurations, providing an interactive example in its most basic form.',
      },
      source: {
        code: `
          <button cck-button>Default Button</button>
          <button cck-button disabled>Disabled Button</button>
        `,
      },
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <story-table [headers]="['Default', 'Disabled']" [fullWidth]="false">
        <story-table-cell row="0" col="0">
          <button cck-button>Button</button>
        </story-table-cell>
        <story-table-cell row="0" col="1">
          <button cck-button disabled>Button</button>
        </story-table-cell>
      </story-table>
    `,
  }),
};
