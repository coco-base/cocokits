import { AngularStoryObj } from '@cocokits/core';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { CheckboxComponent } from '../../src';

export const Color: AngularStoryObj<CheckboxComponent> = {
  name: 'Color',
  tags: ['uiComponentName:checkbox', 'uiComponentPropName:color'],
  parameters: {
    docs: {
      description: {
        story: 'TODO: Add story description',
      },
      source: {
        code: `<cck-checkbox [color]="..."></cck-checkbox>`,
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
          @for (color of uiComponentConfig?.checkbox.color?.values; track color) {
            <th>{{color}}</th>
          }
        </thead>
        <tbody>
          <tr>
            @for (color of uiComponentConfig?.checkbox.color?.values; track color) {
              <td>
                <cck-checkbox [color]="color" [checked]="true">Checkbox Label</cck-checkbox>
              </td>
            }
          </tr>
         
        </tbody>
      </table>
    `,
  }),
};
