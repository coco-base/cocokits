import { Avatar, AvatarGroup } from '@cocokits/react-avatar';
import { CCK_CONTROL, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Color: StoryObj<typeof AvatarGroup> = {
  name: 'Color',
  parameters: {
    docs: {
      description: {
        story: 'Color options enable seamless integration with various themes or to highlight specific actions.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp('color'), renderWithPageTab('Overview')],
      singleControls: ['type'],
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
          import { AvatarGroup } from "@cocokits/react-components";

          export const MyComponent = () => {
            return (
              <>
                <% themeComponentConfig.color.values.map(color => { %>
                  <AvatarGroup
                    <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                    color='<%= color %>'
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
      {args.cckControl.themeComponentConfig.color?.values.map((color, index) => (
        <AvatarGroup key={index} type={args.cckControl.type} color={color}>
          <Avatar src="https://i.pravatar.cc?img=9" />
          <Avatar src="https://i.pravatar.cc?img=10" />
          <Avatar src="https://i.pravatar.cc?img=11" />
        </AvatarGroup>
      ))}
    </>
  ),
};
