import { Badge, BadgeContainer } from '@cocokits/react-badge';
import { renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Type: StoryObj<typeof BadgeContainer> = {
  name: 'Type',
  parameters: {
    docs: {
      description: {
        story:
          'Displays variations in appearance and functionality, demonstrating how different types can be used to create unique BadgeContainer styles.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp('type'), renderWithPageTab('Overview')],
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
          import { BadgeContainer } from "@cocokits/react-components";

          export const MyComponent = () => {
            return (
              <>
                <% themeComponentConfig.type.values.map(type => { %>
                  <BadgeContainer
                    <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                  >
                    <div
                      style={{
                        width: '70px',
                        height: '70px',
                        backgroundColor: 'var(--cck-doc-color-bg-3, #191b23)',
                        border: '3px solid var(--cck-doc-color-border-3, #ffffff33)',
                        borderRadius: '<%= radius %>',
                      }}
                    ></div>
                    <Badge content="2"/>
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
        <BadgeContainer key={index} type={type}>
          <div
            style={{
              width: '70px',
              height: '70px',
              backgroundColor: 'var(--cck-doc-color-bg-3)',
              border: '3px solid var(--cck-doc-color-border-3)',
              borderRadius: args.cckControl.radius,
            }}
          ></div>
          <Badge content="2"/>
        </BadgeContainer>
      ))}
    </>
  ),
};
