import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { IconButtonComponent } from '../../src/lib/icon-button/icon-button.component';

export const ThemeCocokitsRoundedSize: AngularStoryObj<IconButtonComponent> = {
  name: 'Theme Cocokits: Rounded - Size',
  tags: ['theme:cocokits'],
  parameters: {
    docs: {
      description: {
        story: '',
      },
      source: {
        code: `
          <button cck-icon-button data-cck-rounded="true" [size]="...">
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
                  <button cck-icon-button data-cck-rounded="true" [type]="type" [size]="size">
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
