import { AngularStoryObj } from '@cocokits/core';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { RadioButtonComponent } from '../../src';

export const Size: AngularStoryObj<RadioButtonComponent> = {
  name: 'Size',
  tags: ['uiComponentName:radioButton', 'uiComponentPropName:size'],
  parameters: {
    docs: {
      description: {
        story: 'TODO: Add story description',
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
          @for (size of uiComponentConfig?.checkbox.size?.values; track size) {
            <th>{{size}}</th>
          }
        </thead>
        <tbody>
          <tr>
            @for (size of uiComponentConfig?.checkbox.size?.values; track size) {
              <td>
                <cck-radio-group [size]="size" [selected]="1">
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
