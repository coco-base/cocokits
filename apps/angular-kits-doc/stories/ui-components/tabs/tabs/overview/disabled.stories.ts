import { TabsComponent } from '@cocokits/angular-tabs';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Disabled: StoryObj<TabsComponent> = {
  name: 'Disabled',
  parameters: {
    docs: {
      description: {
        story:
          'Disabled tabs prevent user interaction, ensuring that users cannot select or activate them, which is useful for indicating unavailable options.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Overview')],
      singleControls: ['type'],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
            <cck-tabs
             <% if (typeof type !== 'undefined') { %> type='<%= type %>'<% } %>
             [hideContent]="true"
            >
              <cck-tab header="Header 1"/>
              <cck-tab header="Header 2" disabled/>
              <cck-tab header="Header 3"/>
            </cck-tabs>
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
      <cck-tabs [type]="cckControl.type" [hideContent]="true">
        <cck-tab header="Header 1"/>
        <cck-tab header="Header 2" disabled/>
        <cck-tab header="Header 3"/>
      </cck-tabs>
    `,
  }),
};
