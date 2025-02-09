import { MenuComponent } from '@cocokits/angular-menu';
import { CCK_CONTROL, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Size: StoryObj<MenuComponent> = {
  name: 'Size',
  parameters: {
    docs: {
      description: {
        story:
          'The size is adjustable to suit different design needs and screen dimensions, improving both aesthetics and usability.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp('size'), renderWithPageTab('Overview')],
      singleControls: ['type'],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
            <% themeComponentConfig.size.values.map(size => { %>

              <!-- <%= size %> -->
              <cck-menu
                size="<%= size %>"
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
       @for (size of cckControl.themeComponentConfig.size.values; let col = $index; track size) {
        <cck-menu [size]="size" [type]="cckControl.type">
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
