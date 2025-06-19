import { TabsComponent } from '@cocokits/angular-tabs';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { ngThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Default: StoryObj<TabsComponent> = {
  name: 'Default',
  parameters: {
    docs: {
      description: {
        story:
          'Shows the default example with no additional configurations, providing an interactive example in its most basic form.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Overview')],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
          <cck-tabs
            <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
            <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
            <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
          >
          </cck-tabs>
          `,
        },
      ],
      hasControl: true,
      controls: [CCK_CONTROL.type(), CCK_CONTROL.size(), CCK_CONTROL.color(), CCK_CONTROL.additional()],
    },
  },
  render: (args) => {
    return {
      props: {
        ...args,
      },
      // [text]="cckControl.text"
      template: `
        <cck-tabs
          ${ngThemeArgsToTemplate(args)}
        >
        </cck-tabs>
      `,
    };
  },
};
