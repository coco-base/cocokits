import type { StoryObj } from '@storybook/angular';

import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { SvgIconComponent } from '../../src';

export const Default: StoryObj<SvgIconComponent> = {
  name: 'Default',
  parameters: {
    docs: {
      description: {
        story: 'TODO: Add size story description',
      },
      source: {
        code: `<cck-svg-icon [icon]="..." size="..." color="..."></cck-svg-icon>`,
      },
    },
  },
  render: (args) => ({
    props: {
      ...args,
      uiComponentConfig: getSelectedCckTheme()?.uiComponentConfig,
    },
    template: `
      <cck-svg-icon [icon]="icon" [size]="uiComponentConfig?.svgIcon.size?.values.at(-1)"></cck-svg-icon>
    `,
  }),
};
