import { Avatar, AvatarLabel } from '@cocokits/react-avatar';
import { renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Type: StoryObj<typeof AvatarLabel> = {
  name: 'Type',
  parameters: {
    docs: {
      description: {
        story:
          'Displays variations in appearance and functionality, demonstrating how different types can be used to create unique AvatarLabel styles.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp('type'), renderWithPageTab('Overview')],
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
          import { AvatarLabel, Avatar } from "@cocokits/react-components";

          export const MyComponent = () => {
            return (
              <>
                <% themeComponentConfig.type.values.map(type => { %>
                  <AvatarLabel
                    <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                    title="Alex Pearson"
                    description="UX Engineer"
                  >
                    <Avatar src="https://i.pravatar.cc?img=52" />
                  </AvatarLabel>
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
        <AvatarLabel key={index} type={type} title="Alex Pearson" description="UX Engineer">
          <Avatar src="https://i.pravatar.cc?img=52" />
        </AvatarLabel>
      ))}
    </>
  ),
};
