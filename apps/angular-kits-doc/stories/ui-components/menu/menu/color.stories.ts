import { MenuComponent } from '@cocokits/angular-menu';
import { CCK_CONTROL, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Color: StoryObj<MenuComponent> = {
  name: 'Color',
  parameters: {
    docs: {
      description: {
        story: 'Color options enable seamless integration with various themes or to highlight specific actions.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp('color'), renderWithPageTab('Overview')],
      singleControls: ['type'],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
            <% themeComponentConfig.color.values.map(color => { %>

              <!-- <%= color %> -->
              <cck-menu
                color="<%= color %>"
                <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
              >
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
      controls: [CCK_CONTROL.type()],
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
       @for (color of cckControl.themeComponentConfig.color.values; let col = $index; track color) {
        <cck-menu [color]="color" [type]="cckControl.type">
          <cck-menu-item>Edit</cck-menu-item>
          <cck-menu-item>Duplicate</cck-menu-item>
          <cck-divider></cck-divider>
          <cck-menu-item>Archive</cck-menu-item>
          <cck-menu-item>Move</cck-menu-item>
        </cck-menu> 
    `,
  }),
};
