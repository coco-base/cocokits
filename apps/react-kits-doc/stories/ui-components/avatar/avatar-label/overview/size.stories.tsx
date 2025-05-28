import { Avatar, AvatarLabel } from '@cocokits/react-avatar';
import { CCK_CONTROL, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Size: StoryObj<typeof AvatarLabel> = {
  name: 'Size',
  parameters: {
    docs: {
      description: {
        story:
          'The size is adjustable to suit different design needs and screen dimensions, improving both aesthetics and usability.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp('size'), renderWithPageTab('Overview')],
      singleControls: ['type'],
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
          import { AvatarLabel, Avatar } from "@cocokits/react-components";

          export const MyComponent = () => {
            return (
              <>
                <% themeComponentConfig.size.values.map(size => { %>
                  <AvatarLabel
                    <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                    size='<%= size %>'
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
      controls: [CCK_CONTROL.type()],
    },
  },
  render: (args) => (
    <>
      {args.cckControl.themeComponentConfig.size?.values.map((size, index) => (
        <AvatarLabel
          key={index}
          type={args.cckControl.type}
          size={size}
          title="Alex Pearson"
          description="UX Engineer">
          <Avatar src="https://i.pravatar.cc?img=52" />
        </AvatarLabel>
      ))}
    </>
  ),
};
