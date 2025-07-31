import { Badge, BadgeContainer } from '@cocokits/react-badge';
import { CCK_CONTROL, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Size: StoryObj<typeof BadgeContainer> = {
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
                  <BadgeContainer
                    <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                    size='<%= size %>'
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
      controls: [CCK_CONTROL.type()],
    },
  },
  render: (args) => (
    <>
      {args.cckControl.themeComponentConfig.size?.values.map((size, index) => (
        <BadgeContainer key={index} type={args.cckControl.type} size={size}>
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
