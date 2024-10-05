import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { IconButtonComponent } from '../../src/lib/icon-button/icon-button.component';

export const ThemeCocokitsRoundedColor: AngularStoryObj<IconButtonComponent> = {
  name: 'Theme Cocokits: Rounded - Color',
  tags: ['theme:cocokits'],
  parameters: {
    docs: {
      description: {
        story: '',
      },
      source: {
        code: `
          <button cck-icon-button data-cck-rounded="true" [color]="...">
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
                  <button cck-icon-button data-cck-rounded="true" [type]="type" [color]="color">
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
