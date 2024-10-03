import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { ButtonComponent } from '../../src/lib/button/button.component';

export const Color: AngularStoryObj<ButtonComponent> = {
  name: 'Color',
  tags: ['uiComponentName:button', 'uiComponentPropName:color'],
  parameters: {
    docs: {
      description: {
        story: 'Color options enable seamless integration with various themes or to highlight specific actions.',
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
      themeName: getSelectedCckTheme()?.name,
    },
    template: `
      <table class="story-variant-table">
        <thead>
          <th></th>
          @for (color of uiComponentConfig?.button.color?.values; track color) {
            <th>{{color}}</th>
          }
          <th>Disabled</th>
        </thead>
        <tbody>
          @for (type of uiComponentConfig?.button.type?.values; track type) {
            <tr [class.hidden]="themeName === 'FrameX' && type === 'secondary'">
              <td>{{type}}</td>
              @for (color of uiComponentConfig?.button.color?.values; track color) {
                <td>
                  <button cck-button [type]="type" [color]="color">Button</button>
                </td>
              }
              <td>
                  <button cck-button [type]="type" [color]="color" disabled>Button</button>
                </td>
            </tr>
          }
        </tbody>
      </table>
    `,
  }),
};
