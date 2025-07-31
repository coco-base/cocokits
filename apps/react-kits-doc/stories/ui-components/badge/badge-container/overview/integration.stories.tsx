import { Icons } from '@cocokits/common-icons';
import { Avatar, AvatarLabel } from '@cocokits/react-avatar';
import { Badge, BadgeContainer } from '@cocokits/react-badge';
import { IconButton } from '@cocokits/react-button';
import { SvgIcon } from '@cocokits/react-icon';
import { renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj, withWrapperDecorator } from '@cocokits/storybook-addon-theme-react';

export const Integration: StoryObj<typeof BadgeContainer> = {
  name: 'Integration',
  decorators: [withWrapperDecorator({ insideBox: true })],
  parameters: {
    docs: {
      description: {
        story: 'Badges attached to interactive components.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Overview')],
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
          import { BadgeContainer } from "@cocokits/react-components";

          export const MyComponent = () => {
            return (
              <>
                <% ['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(position => { %>
                  <BadgeContainer
                    <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                    position='<%= position %>'
                    radius="12px"
                  >
                    <div
                      style={{
                        width: '70px',
                        height: '70px',
                        backgroundColor: 'var(--cck-doc-color-bg-3, #191b23)',
                        border: '3px solid var(--cck-doc-color-border-3, #ffffff33)',
                        borderRadius: '12px',
                      }}
                    ></div>
                    <Badge content="2"/>
                  </BadgeContainer>
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
      <BadgeContainer position="top-right">
        <IconButton>
          <SvgIcon icon={Icons.heartFill} />
        </IconButton>
        <Badge type={args.cckControl.type} content="2" />
      </BadgeContainer>

      <BadgeContainer position="top-right" radius="50%">
        <Avatar src="https://i.pravatar.cc?img=9" />
        <Badge type={args.cckControl.type} content="2" />
      </BadgeContainer>

      <BadgeContainer position="top-right" radius="50%">
        <Avatar src="https://i.pravatar.cc?img=10" />
        <Badge type={args.cckControl.type} />
      </BadgeContainer>

      <AvatarLabel title="Alex Pearson" description="UX Engineer">
        <BadgeContainer position="bottom-right" radius="50%">
          <Avatar src="https://i.pravatar.cc?img=11" />
          <Badge type={args.cckControl.type} />
        </BadgeContainer>
      </AvatarLabel>
    </>
  ),
};
