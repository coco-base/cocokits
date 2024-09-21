import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { RadioButtonComponent } from '../../src';

export const Color: AngularStoryObj<RadioButtonComponent> = {
  name: 'Color',
  tags: ['uiComponentName:radioGroup', 'uiComponentPropName:color'],
  parameters: {
    docs: {
      description: {
        story: 'Color options enable seamless integration with various themes or to highlight specific actions.',
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
      <table class="story-variant-table story-variant-table--no-col-header">
        <thead>
          @for (color of uiComponentConfig?.radioGroup.color?.values; track color) {
            <th>{{color}}</th>
          }
        </thead>
        <tbody>
          <tr>
            @for (color of uiComponentConfig?.radioGroup.color?.values; track color) {
              <td>
                <cck-radio-group [color]="color" [selected]="1">
                  <cck-radio-button [value]="1">Radio Button 1</cck-radio-button>
                  <cck-radio-button [value]="2">Radio Button 2</cck-radio-button>
                  <cck-radio-button [value]="3">Radio Button 3</cck-radio-button>
                </cck-radio-group>
              </td>
            }
          </tr>
         
        </tbody>
      </table>
    `,
  }),
};
