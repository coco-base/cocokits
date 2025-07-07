import { TabsComponent } from '@cocokits/angular-tabs';
import { CCK_CONTROL, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Color: StoryObj<TabsComponent> = {
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

            <!------------ <%= color %> ------------>
            <cck-tabs
              <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
              color='<%= color %>'
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
      @for (color of cckControl.themeComponentConfig.color.values; let col = $index; track color) {
        <cck-tabs [type]="cckControl.type" [color]="color" [hideContent]="true">
          <cck-tab header="Header 1"/>
            <cck-tab header="Header 2"/>
            <cck-tab header="Header 3"/>
        </cck-tabs>
      }
    `,
  }),
};
