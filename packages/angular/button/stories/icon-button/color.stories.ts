import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { IconButtonComponent } from '../../src/lib/icon-button/icon-button.component';

export const Color: AngularStoryObj<IconButtonComponent> = {
  name: 'Color',
  tags: ['uiComponentName:iconButton', 'uiComponentPropName:color'],
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
          @for (color of uiComponentConfig?.iconButton.color?.values; track color) {
            <th>{{color}}</th>
          }
        </thead>
        <tbody>
          @for (type of uiComponentConfig?.iconButton.type?.values; track type) {
            <tr>
              <td>{{type}}</td>
              @for (color of uiComponentConfig?.iconButton.color?.values; track color) {
                <td>
                  <button cck-icon-button [type]="type" [color]="color">
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
