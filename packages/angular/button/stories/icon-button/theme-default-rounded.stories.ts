import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { IconButtonComponent } from '../../src/lib/icon-button/icon-button.component';

export const ThemeDefaultRounded: AngularStoryObj<IconButtonComponent> = {
  name: 'Theme Default: Rounded',
  tags: ['theme:default'],
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
      uiComponentConfig: getSelectedCckTheme()?.uiComponentConfig,
    },
    template: `
        <button cck-icon-button data-cck-rounded="true">
          <cck-svg-icon [icon]="icon"></cck-svg-icon>
        </button>
    `,
  }),
};
