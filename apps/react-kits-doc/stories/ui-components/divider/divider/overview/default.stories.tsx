import { Divider } from '@cocokits/react-components';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { reactThemeArgsToTemplate,StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Default: StoryObj<typeof Divider> = {
  name: 'Default',
  parameters: {
    docs: {
      description: {
        story:
          'Shows the default example with no additional configurations, providing an interactive example in its most basic form.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Overview')],
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
           import { Divider } from "@cocokits/react-components";
  
            export const MyComponent = () => {
              return (
                <>
                  <Divider
                    <% if (typeof type !== 'undefined') { %> type="<%= type %>" <% } %>
                    <% if (typeof size !== 'undefined') { %> size="<%= size %>" <% } %>
                    <% if (typeof color !== 'undefined') { %> color="<%= color %>" <% } %>
                  />
                </>
              );
            }
          `,
        },
      ],
      hasControl: true,
      controls: [CCK_CONTROL.type(), CCK_CONTROL.color(), CCK_CONTROL.size(), CCK_CONTROL.additional()],
    },
  },
  render: (args) => <Divider style={{ margin: '0 auto' }} {...reactThemeArgsToTemplate(args)} />,
};
