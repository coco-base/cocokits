import { Avatar, AvatarLabel } from '@cocokits/react-avatar';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { reactThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Default: StoryObj<typeof AvatarLabel> = {
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
          import { AAvatarLabel, Avatar } from '@cocokits/react-components';

          export const MyComponent = () => {
            return (
              <AvatarLabel
                <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
                <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
                title="<%= title %>"
                description="<%= description %>"
                avatarPosition="<%= avatarPosition %>"
                labelAlignment="<%= labelAlignment %>"
              >
                <Avatar src="<%= src %>" />
              </AvatarLabel>
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
        CCK_CONTROL.customText('Title', 'Alex Pearson'),
        CCK_CONTROL.customText('Description', 'UX Engineer'),
        CCK_CONTROL.srcUrl('https://i.pravatar.cc?img=52'),
        CCK_CONTROL.customSelect('Avatar Position', ['left', 'right', 'top', 'bottom']),
        CCK_CONTROL.customSelect('Label Alignment', ['vertical', 'horizontal']),
        CCK_CONTROL.additional(),
      ],
    },
  },
  args: {},
  render: (args) => (
    <AvatarLabel
      {...reactThemeArgsToTemplate(args)}
      title={args.cckControl.title}
      description={args.cckControl.description}
      avatarPosition={args.cckControl.avatarPosition}
      labelAlignment={args.cckControl.labelAlignment}>
      <Avatar src={args.cckControl.src} />
    </AvatarLabel>
  ),
};
