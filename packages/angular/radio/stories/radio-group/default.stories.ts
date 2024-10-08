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
      <story-table
        [headers]="['Default', 'Disabled', 'Disabled - Checked', 'Disabled - Partial']">
        
        <!-- Default -->
        <story-table-cell row="0" col="0">
          <cck-radio-group>
            <cck-radio-button [value]="1">Radio Button 1</cck-radio-button>
            <cck-radio-button [value]="2">Radio Button 2</cck-radio-button>
            <cck-radio-button [value]="3">Radio Button 3</cck-radio-button>
          </cck-radio-group>
        </story-table-cell>
        
        <!-- Disabled -->
        <story-table-cell row="0" col="1">
          <cck-radio-group [disabled]="true">
            <cck-radio-button [value]="1">Radio Button 1</cck-radio-button>
            <cck-radio-button [value]="2">Radio Button 2</cck-radio-button>
            <cck-radio-button [value]="3">Radio Button 3</cck-radio-button>
          </cck-radio-group>
        </story-table-cell>
        
        <!-- Disabled - Checked -->
        <story-table-cell row="0" col="2">
          <cck-radio-group [disabled]="true" [selected]="1">
            <cck-radio-button [value]="1">Radio Button 1</cck-radio-button>
            <cck-radio-button [value]="2">Radio Button 2</cck-radio-button>
            <cck-radio-button [value]="3">Radio Button 3</cck-radio-button>
          </cck-radio-group>
        </story-table-cell>
        
        <!-- Disabled - Partial -->
        <story-table-cell row="0" col="3">
          <cck-radio-group [selected]="1">
            <cck-radio-button [value]="1">Radio Button 1</cck-radio-button>
            <cck-radio-button [value]="2" [disabled]="true">Radio Button 2</cck-radio-button>
            <cck-radio-button [value]="3">Radio Button 3</cck-radio-button>
          </cck-radio-group>
        </story-table-cell>
        
      </story-table>
    `,
  }),
};
