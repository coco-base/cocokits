import { Badge, BadgeContainer } from '@cocokits/react-badge';
import { renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Position: StoryObj<typeof BadgeContainer> = {
  name: 'Position',
  parameters: {
    docs: {
      description: {
        story:
          'The position of the badge can be adjusted to suit different design needs and screen dimensions, improving both aesthetics and usability.',
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
      {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map((position, index) => (
        <BadgeContainer key={index} position={position} type={args.cckControl.type} radius="12px">
          <div
            style={{
              width: '70px',
              height: '70px',
              backgroundColor: 'var(--cck-doc-color-bg-3)',
              border: '3px solid var(--cck-doc-color-border-3)',
              borderRadius: '12px',
            }}></div>
          <Badge content="2" />
        </BadgeContainer>
      ))}
    </>
  ),
};
