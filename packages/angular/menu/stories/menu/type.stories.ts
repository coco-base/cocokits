import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { MenuComponent } from '../../src';
import { renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';

export const Type: AngularStoryObj<MenuComponent> = {
  name: 'Type',
  tags: ['uiBaseComponentName:menu', 'uiBaseComponentPropName:type'],
  parameters: {
    docs: {
      description: {
        story:
          'Displays variations in appearance and functionality, demonstrating how different types can be used to create unique button styles.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp('type'), renderWithPageTab('Overview')],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
            <% themeComponentConfig.type.values.map(type => { %>

              <!-- <%= type %> -->
              <cck-menu [type]="<%= type %>">
                <cck-menu-item>Edit</cck-menu-item>
                <cck-menu-item>Duplicate</cck-menu-item>
                <cck-divider></cck-divider>
                <cck-menu-item>Archive</cck-menu-item>
                <cck-menu-item>Move</cck-menu-item>
              </cck-menu>
            <% }) %>
          `,
        },
      ],
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
       @for (type of cckControl.themeComponentConfig.type.values; let col = $index; track type) {
        <cck-menu [type]="type">
          <cck-menu-item>Edit</cck-menu-item>
          <cck-menu-item>Duplicate</cck-menu-item>
          <cck-divider></cck-divider>
          <cck-menu-item>Archive</cck-menu-item>
          <cck-menu-item>Move</cck-menu-item>
        </cck-menu>
      }
    `,
  }),
};
