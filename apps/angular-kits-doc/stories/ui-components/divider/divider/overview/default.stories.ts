import { DividerComponent } from '@cocokits/angular-divider';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { ngThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Default: StoryObj<DividerComponent> = {
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
            <cck-divider
              <% if (typeof type !== 'undefined') { %> type="<%= type %>" <% } %>
              <% if (typeof size !== 'undefined') { %> size="<%= size %>" <% } %>
              <% if (typeof color !== 'undefined') { %> color="<%= color %>" <% } %>
            >
            </cck-divider>
          `,
        },
      ],
      hasControl: true,
      controls: [CCK_CONTROL.type(), CCK_CONTROL.color(), CCK_CONTROL.size(), CCK_CONTROL.additional()],
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
        <cck-divider style="margin: 0 auto" ${ngThemeArgsToTemplate(args)}></cck-divider>
    `,
  }),
};
