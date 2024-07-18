import { AngularStoryObj } from '@cocokits/core';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { IconButtonComponent } from '../../src/lib/icon-button/icon-button.component';

export const Size: AngularStoryObj<IconButtonComponent> = {
  name: 'Size',
  tags: ['uiComponentName:iconButton', 'uiComponentPropName:size'],
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
        <table class="story-variant-table">
        <thead>
          <th></th>
          @for (size of uiComponentConfig?.iconButton.size?.values; track size) {
            <th>{{size}}</th>
          }
        </thead>
        <tbody>
          @for (type of uiComponentConfig?.iconButton.type?.values; track type) {
            <tr>
              <td>{{type}}</td>
              @for (size of uiComponentConfig?.iconButton.size?.values; track size) {
                <td>
                  <button cck-icon-button [type]="type" [size]="size">
                    <cck-svg-icon [icon]="icon"></cck-svg-icon>
                  </button>
                </td>
              }
            </tr>
          }
         
        </tbody>
      </table>
    `,
  }),
};
