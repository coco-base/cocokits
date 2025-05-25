import { AvatarGroup } from '@cocokits/react-avatar';
import { renderWithPageTab } from '@cocokits/storybook-addon-theme';
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
              >
              </AvatarGroup>
            )
          }
          `,
        },
      ],
      renderConditions: [renderWithPageTab('Overview')],
      hasControl: true,
      controls: [
        // CCK_CONTROL.text('avatar-group'),
      ],
    },
  },
  args: {},
  // text={args.cckControl.text}
  render: (args) => <AvatarGroup {...reactThemeArgsToTemplate(args)}></AvatarGroup>,
};
