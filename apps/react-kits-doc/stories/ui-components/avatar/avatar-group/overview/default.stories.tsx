import { Avatar, AvatarGroup } from '@cocokits/react-avatar';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { reactThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Default: StoryObj<typeof AvatarGroup> = {
  name: 'Default',
  parameters: {
    docs: {
      description: {
        story:
          'Shows the default example with no additional configurations, providing an interactive example in its most basic form.',
      },
    },
    cckAddon: {
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
          import { AvatarGroup, SvgIcon} from '@cocokits/react-components';

          export const MyComponent = () => {
            return (
              <AvatarGroup
                <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
                <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
                direction='<%= avatarDirection %>'
              >
                <Avatar src="https://i.pravatar.cc?img=9"/>
                <Avatar src="https://i.pravatar.cc?img=10"/>
                <Avatar src="https://i.pravatar.cc?img=11"/>
                <Avatar src="https://i.pravatar.cc?img=12"/>
              </AvatarGroup>
            )
          }
          `,
        },
      ],
      renderConditions: [renderWithPageTab('Overview')],
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
  args: {},
  render: (args) => (
    <AvatarGroup {...reactThemeArgsToTemplate(args)} direction={args.cckControl.avatarDirection}>
      <Avatar src="https://i.pravatar.cc?img=9" />
      <Avatar src="https://i.pravatar.cc?img=10" />
      <Avatar src="https://i.pravatar.cc?img=11" />
      <Avatar src="https://i.pravatar.cc?img=12" />
    </AvatarGroup>
  ),
};
