import { Avatar, AvatarGroup } from '@cocokits/react-avatar';
import { CCK_CONTROL, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Size: StoryObj<typeof AvatarGroup> = {
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
          import { <%= componentName.className %> } from "@cocokits/react-components";

          export const MyComponent = () => {
            return (
              <>
                <% themeComponentConfig.size.values.map(size => { %>
                  <AvatarGroup
                    <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                    size='<%= size %>'
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
      controls: [CCK_CONTROL.type()],
    },
  },
  render: (args) => (
    <>
      {args.cckControl.themeComponentConfig.size?.values.map((size, index) => (
        <AvatarGroup key={index} type={args.cckControl.type} size={size}>
          <Avatar src="https://i.pravatar.cc?img=9" />
          <Avatar src="https://i.pravatar.cc?img=10" />
          <Avatar src="https://i.pravatar.cc?img=11" />
        </AvatarGroup>
      ))}
    </>
  ),
};
