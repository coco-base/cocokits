import { Table } from '@cocokits/react-table';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { reactThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Default: StoryObj<typeof Table> = {
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
          import { Table, SvgIcon} from '@cocokits/react-components';

          export const MyComponent = () => {
            return (
              <Table
                <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
                <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
              >
              </Table>
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
  render: (args) => <Table {...reactThemeArgsToTemplate(args)}></Table>,
};
