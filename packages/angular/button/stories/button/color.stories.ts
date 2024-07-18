import { AngularStoryObj } from '@cocokits/core';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { ButtonComponent } from '../../src/lib/button/button.component';

export const Color: AngularStoryObj<ButtonComponent> = {
  name: 'Color',
  tags: ['uiComponentName:button', 'uiComponentPropName:color'],
  parameters: {
    docs: {
      description: {
        story: 'TODO: Add story description',
      },
      source: {
        code: `<button cck-button [color]="..."></button>`,
      },
    },
  },
  render: (args) => ({
    props: {
      ...args,
      uiComponentConfig: getSelectedCckTheme()?.uiComponentConfig,
    },
    template: `
      <table class="story-variant-table">
        <thead>
          <th></th>
          @for (color of uiComponentConfig?.button.color?.values; track color) {
            <th>{{color}}</th>
          }
        </thead>
        <tbody>
          @for (type of uiComponentConfig?.button.type?.values; track type) {
            <tr>
              <td>{{type}}</td>
              @for (color of uiComponentConfig?.button.color?.values; track color) {
                <td>
                  <button cck-button [type]="type" [color]="color">button</button>
                </td>
              }
            </tr>
          }
         
        </tbody>
      </table>
    `,
  }),
};
