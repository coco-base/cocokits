import { Tabs } from '@cocokits/react-tabs';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { reactThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Default: StoryObj<typeof Tabs> = {
  name: 'Default',
  parameters: {
    docs: {
      description: {
        story:
          'Shows the default example with no additional configurations, providing an interactive example in its most basic form.',
      },
    },
    cckAddon: {
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
          import { Tabs, SvgIcon} from '@cocokits/react-components';

          export const MyComponent = () => {
            return (
              <Tabs
                <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
                <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
              >
              </Tabs>
            )
          }
          `,
        },
      ],
      renderConditions: [renderWithPageTab('Overview')],
      hasControl: true,
      controls: [CCK_CONTROL.type(), CCK_CONTROL.size(), CCK_CONTROL.color(), CCK_CONTROL.additional()],
    },
  },
  args: {},
  // text={args.cckControl.text}
  render: (args) => <Tabs {...reactThemeArgsToTemplate(args)}></Tabs>,
};
