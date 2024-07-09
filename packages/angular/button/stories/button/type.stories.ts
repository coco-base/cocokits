import type { StoryObj } from '@storybook/angular';

import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { ButtonComponent } from '../../src/lib/button/button.component';

export const Type: StoryObj<ButtonComponent> = {
  name: 'Type',
  parameters: {
    docs: {
      description: {
        story: 'TODO: Add story description',
      },
      source: {
        code: `<button cck-button [type]="..."></button>`,
      },
    },
  },
  render: (args) => ({
    props: {
      ...args,
      uiComponentConfig: getSelectedCckTheme()?.uiComponentConfig,
    },
    template: `
        @for (type of uiComponentConfig?.button.type?.values; track type) {
        <div class="flex-col flex-center gap-12">
          <button cck-button [type]="type">button</button>
          <span class="p-sm-regular-2">{{type}}</span>
        </div>
      }
    `,
  }),
};
