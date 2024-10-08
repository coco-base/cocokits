import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { RadioButtonComponent } from '../../src';

export const Type: AngularStoryObj<RadioButtonComponent> = {
  name: 'Type',
  tags: ['uiComponentName:radioButton', 'uiComponentPropName:type'],
  parameters: {
    docs: {
      description: {
        story:
          'Displays variations in appearance and functionality, demonstrating how different types can be used to create unique button styles.',
      },
      source: {
        code: `TODO: ...`,
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
        [headers]="uiComponentConfig?.radioButton.type?.values">
        @for (type of uiComponentConfig?.radioButton.type?.values; let i = $index; track type) {
          <story-table-cell row="0" [col]="i">
            <cck-radio-button [type]="type" [value]="1">Radio Button</cck-radio-button>
          </story-table-cell>
        }
      </story-table>
    `,
  }),
};
