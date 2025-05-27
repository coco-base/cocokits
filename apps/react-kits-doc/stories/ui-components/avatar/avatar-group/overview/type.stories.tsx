import { Avatar, AvatarGroup } from '@cocokits/react-avatar';
import { renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Type: StoryObj<typeof AvatarGroup> = {
  name: 'Type',
  parameters: {
    docs: {
      description: {
        story:
          'Displays variations in appearance and functionality, demonstrating how different types can be used to create unique AvatarGroup styles.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp('type'), renderWithPageTab('Overview')],
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
          import { AvatarGroup, Avatar } from "@cocokits/react-components";

          export const MyComponent = () => {
            return (
              <>
                <% themeComponentConfig.type.values.map(type => { %>
                  <AvatarGroup
                    <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                  >
                    <Avatar src="https://i.pravatar.cc?img=9"/>
                    <Avatar src="https://i.pravatar.cc?img=10"/>
                    <Avatar src="https://i.pravatar.cc?img=11"/>
                    <Avatar src="https://i.pravatar.cc?img=12"/>
                  </AvatarGroup>
                <% }) %>
              </>
            );
          }
          `,
        },
      ],
    },
  },
  render: (args) => (
    <>
      {args.cckControl.themeComponentConfig.type?.values.map((type, index) => (
        <AvatarGroup key={index} type={type}>
          <Avatar src="https://i.pravatar.cc?img=9" />
          <Avatar src="https://i.pravatar.cc?img=10" />
          <Avatar src="https://i.pravatar.cc?img=11" />
        </AvatarGroup>
      ))}
    </>
  ),
};
