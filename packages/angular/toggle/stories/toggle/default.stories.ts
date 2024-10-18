import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { ToggleComponent } from '../../src/lib/toggle/toggle.component';

export const Default: AngularStoryObj<ToggleComponent> = {
  name: 'Default',
  parameters: {
    docs: {
      description: {
        story:
          'Shows the default example with no additional configurations, providing an interactive example in its most basic form.',
      },
      source: {
        code: `
          <cck-toggle [checked]="true">Slide me!</cck-toggle>
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
        [headers]="['Default', 'Label Before', 'Disabled']">
        
        <!-- Default -->
        <story-table-cell row="0" col="0">
          <cck-toggle checked="true">Slide me!</cck-toggle>
        </story-table-cell>
        
        <!-- Label Before -->
        <story-table-cell row="0" col="1">
          <cck-toggle checked="true" [labelPosition]="'before'">Slide me!</cck-toggle>
        </story-table-cell>
        
        <!-- Disabled -->
        <story-table-cell row="0" col="2">
          <cck-toggle checked="true" disabled="true">Slide me!</cck-toggle>
        </story-table-cell>
      </story-table>
    `,
  }),
};
