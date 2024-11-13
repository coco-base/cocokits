import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { IconButtonComponent } from '../../src/lib/icon-button/icon-button.component';

export const ThemeCocokitsRounded: AngularStoryObj<IconButtonComponent> = {
  name: 'Theme Cocokits: Rounded',
  tags: ['theme:cocokits'],
  parameters: {
    docs: {
      description: {
        story:
          "This story presents the IconButtonComponent in its rounded form, showcasing how the button's appearance can be customized to provide a softer, circular style",
      },
      source: {
        code: `
        <button cck-icon-button data-cck-rounded="true">
          <cck-svg-icon [icon]="..."></cck-svg-icon>
        </button>
        `,
      },
    },
  },
  render: (args) => ({
    props: {
      ...args,
      themeComponentConfig: getSelectedCckTheme()?.themeConfig.components,
    },
    template: `
      <story-table
        [headers]="themeComponentConfig?.button?.type?.values">
        <story-table-cell row="0" col="0">
          <button cck-icon-button data-cck-rounded="true">
            <cck-svg-icon [icon]="icon"></cck-svg-icon>
          </button>
        </story-table-cell>
        <story-table-cell row="0" col="1">
          <button cck-icon-button data-cck-rounded="true" disabled>
            <cck-svg-icon [icon]="icon"></cck-svg-icon>
          </button>
        </story-table-cell>
      </story-table>
    `,
  }),
};
