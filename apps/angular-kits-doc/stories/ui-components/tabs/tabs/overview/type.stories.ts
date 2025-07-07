import { TabsComponent } from '@cocokits/angular-tabs';
import { renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Type: StoryObj<TabsComponent> = {
  name: 'Type',
  parameters: {
    docs: {
      description: {
        story:
          'Displays variations in appearance and functionality, demonstrating how different types can be used to create unique Tabs styles.',
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


            <!------------ <%= type %> ------------>
            <cck-tabs type='<%= type %>' [hideContent]="true">
              <cck-tab header="Header 1"/>
              <cck-tab header="Header 2"/>
              <cck-tab header="Header 3"/>
            </cck-tabs>
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
      @for (type of cckControl.themeComponentConfig?.type?.values; let col = $index; track type) {
        <cck-tabs [type]="type" [hideContent]="true">
          <cck-tab header="Header 1"/>
          <cck-tab header="Header 2"/>
          <cck-tab header="Header 3"/>
        </cck-tabs>
      }
    `,
  }),
};
