import { TabsComponent } from '@cocokits/angular-tabs';
import { CCK_CONTROL, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Size: StoryObj<TabsComponent> = {
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

            <!------------ <%= size %> ------------>
            <cck-tabs
             <% if (typeof type !== 'undefined') { %> type='<%= type %>'<% } %>
              size='<%= size %>'
              [hideContent]="true"
            >
              <cck-tab header="Header 1"/>
              <cck-tab header="Header 2"/>
              <cck-tab header="Header 3"/>
            </cck-tabs>
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
      @for (size of cckControl.themeComponentConfig?.size?.values; let col = $index; track size) {
        <cck-tabs [type]="cckControl.type" [size]="size" [hideContent]="true">
          <cck-tab header="Header 1"/>
            <cck-tab header="Header 2"/>
            <cck-tab header="Header 3"/>
        </cck-tabs>
      }
    `,
  }),
};
