import { getInstance } from '@cocokits/common-utils';
import { AngularStoryObj } from '@cocokits/internal-model';
import { PreviewThemeEvent } from '@cocokits/storybook-addon-theme';

import { ButtonComponent } from '../../src/lib/button/button.component';

export const Type: AngularStoryObj<ButtonComponent> = {
  name: 'Type',
  tags: ['uiBaseComponentName:button', 'uiBaseComponentPropName:type'],
  parameters: {
    docs: {
      description: {
        story:
          'Displays variations in appearance and functionality, demonstrating how different types can be used to create unique button styles.',
      },
    },
    cckAddon: {
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
          <% cckThemeComponentConfig.type.values.map(type => { %>
            <button cck-button type='<%= type %>'><%= type %></button>
          <% }) %>
          `,
        },
      ],
    },
  },
  render: (args) => ({
    props: {
      ...args,
      themeComponentConfig: getInstance(PreviewThemeEvent).getCurrentTheme().themeConfig.components.button,
    },
    template: `
      <@for (type of themeComponentConfig?.type?.values; let col = $index; track type) {
        <button cck-button [type]="type">{{type}}</button>
      }
    `,
  }),
};
