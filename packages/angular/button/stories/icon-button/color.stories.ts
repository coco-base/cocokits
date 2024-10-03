import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { IconButtonComponent } from '../../src/lib/icon-button/icon-button.component';

export const Color: AngularStoryObj<IconButtonComponent> = {
  name: 'Color',
  tags: ['uiComponentName:iconButton', 'uiComponentPropName:color'],
  parameters: {
    docs: {
      description: {
        story: 'Color options enable seamless integration with various themes or to highlight specific actions.',
      },
      source: {
        code: `
          <button cck-icon-button [color]="...">
            <cck-svg-icon [icon]="..."></cck-svg-icon>
          </button>
        `,
      },
    },
  },
  render: (args) => ({
    props: {
      ...args,
      uiComponentConfig: getSelectedCckTheme()?.uiComponentConfig,
      themeName: getSelectedCckTheme()?.name,
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
            <tr [class.hidden]="themeName === 'Frames X' && type === 'secondary'">
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
