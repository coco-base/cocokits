import type { StoryObj } from '@storybook/angular';

import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { ButtonComponent } from '../../src/lib/button/button.component';

export const Size: StoryObj<ButtonComponent> = {
  name: 'Size',
  parameters: {
    docs: {
      description: {
        story: 'TODO: Add story description',
      },
      source: {
        code: `<button cck-button [size]="..."></button>`,
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
          @for (size of uiComponentConfig?.button.size?.values; track size) {
            <th>{{size}}</th>
          }
        </thead>
        <tbody>
          @for (type of uiComponentConfig?.button.type?.values; track type) {
            <tr>
              <td>{{type}}</td>
              @for (size of uiComponentConfig?.button.size?.values; track size) {
                <td>
                  <button cck-button [type]="type" [size]="size">button</button>
                </td>
              }
            </tr>
          }
         
        </tbody>
      </table>
    `,
  }),
};
