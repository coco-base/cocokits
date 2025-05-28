import { AvatarGroupComponent } from '@cocokits/angular-avatar';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
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
            direction='<%= avatarDirection %>'
          >
            <cck-avatar src="https://i.pravatar.cc?img=9"/>
            <cck-avatar src="https://i.pravatar.cc?img=10"/>
            <cck-avatar src="https://i.pravatar.cc?img=11"/>
            <cck-avatar src="https://i.pravatar.cc?img=12"/>
          </cck-avatar-group>
          `,
        },
      ],
      hasControl: true,
      controls: [
        CCK_CONTROL.type(),
        CCK_CONTROL.size(),
        CCK_CONTROL.color(),
        CCK_CONTROL.additional(),
        CCK_CONTROL.avatarDirection(),
      ],
    },
  },
  render: (args) => {
    return {
      props: {
        ...args,
      },
      template: `
        <cck-avatar-group
          ${ngThemeArgsToTemplate(args)}
          [direction]="cckControl.avatarDirection"
        >
          <cck-avatar src="https://i.pravatar.cc?img=9"/>
          <cck-avatar src="https://i.pravatar.cc?img=10"/>
          <cck-avatar src="https://i.pravatar.cc?img=11"/>
          <cck-avatar src="https://i.pravatar.cc?img=12"/>
        </cck-avatar-group>
      `,
    };
  },
};
