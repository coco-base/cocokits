import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { RadioButtonComponent } from '../../src';

export const Type: AngularStoryObj<RadioButtonComponent> = {
  name: 'Type',
  tags: ['uiBaseComponentName:radioGroup', 'uiBaseComponentPropName:type'],
  parameters: {
    docs: {
      description: {
        story:
          'Displays variations in appearance and functionality, demonstrating how different types can be used to create unique button styles.',
      },
      source: {
        code: `
          <cck-radio-group [type]="..." [selected]="1">
            <cck-radio-button [value]="1">Radio Button 1</cck-radio-button>
            <cck-radio-button [value]="2">Radio Button 2</cck-radio-button>
            <cck-radio-button [value]="3">Radio Button 3</cck-radio-button>
          </cck-radio-group>
        `,
      },
    },
  },
  render: (args) => ({
    props: {
      ...args,
      themeComponentConfig: getSelectedCckTheme()?.themeConfig.components,
    },
    template: `
      <story-table
        [headers]="themeComponentConfig?.radioGroup.type?.values">
        @for (type of themeComponentConfig?.radioGroup.type?.values; let i = $index; track type) {
          <story-table-cell row="0" [col]="i">
            <cck-radio-group [type]="type" [selected]="1">
              <cck-radio-button [value]="1">Radio Button 1</cck-radio-button>
              <cck-radio-button [value]="2">Radio Button 2</cck-radio-button>
              <cck-radio-button [value]="3">Radio Button 3</cck-radio-button>
            </cck-radio-group>
          </story-table-cell>
        }
      </story-table>
    `,
  }),
};
