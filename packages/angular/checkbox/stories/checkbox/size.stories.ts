import { AngularStoryObj } from '@cocokits/core';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { CheckboxComponent } from '../../src';

export const Size: AngularStoryObj<CheckboxComponent> = {
  name: 'Size',
  tags: ['uiComponentName:checkbox', 'uiComponentPropName:size'],
  parameters: {
    docs: {
      description: {
        story: 'TODO: Add story description',
      },
      source: {
        code: `<cck-checkbox [size]="..."></cck-checkbox>`,
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
                <cck-checkbox [size]="size" [checked]="true">Checkbox Label</cck-checkbox>
              </td>
            }
          </tr>
         
        </tbody>
      </table>
    `,
  }),
};
