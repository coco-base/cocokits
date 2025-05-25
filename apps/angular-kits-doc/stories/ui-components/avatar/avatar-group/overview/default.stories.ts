import { AvatarGroupComponent } from '@cocokits/angular-avatar';
import { renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { ngThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Default: StoryObj<AvatarGroupComponent> = {
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
          <cck-avatar-group
            <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
            <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
            <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
          >
          </cck-avatar-group>
          `,
        },
      ],
      hasControl: true,
      controls: [
        // CCK_CONTROL.text('cck-avatar-group'),
      ],
    },
  },
  render: (args) => {
    return {
      props: {
        ...args,
      },
      // [text]="cckControl.text"
      template: `
        <cck-avatar-group
          ${ngThemeArgsToTemplate(args)}
        >
        </cck-avatar-group>
      `,
    };
  },
};
