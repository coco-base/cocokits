import { AngularStoryObj } from '@cocokits/core';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { IconButtonComponent } from '../../src/lib/icon-button/icon-button.component';

export const ThemeDefaultRounded: AngularStoryObj<IconButtonComponent> = {
  name: 'Theme Default: Rounded',
  tags: ['theme:default'],
  parameters: {
    docs: {
      description: {
        story: 'TODO: Add story description',
      },
      source: {
        code: `TODO: Add source code of story`,
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
