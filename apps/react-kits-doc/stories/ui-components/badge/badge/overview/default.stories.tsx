import { Badge } from '@cocokits/react-badge';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { reactThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Default: StoryObj<typeof Badge> = {
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
          import { Badge, SvgIcon} from '@cocokits/react-components';

          export const MyComponent = () => {
            return (
              <Badge
                <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
                <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
                <% if (max > 0) { %> max={<%= max %>} <% } %>
                <% if (content !== '') { %> content='<%= content %>' <% } %>
                <% if (hide) { %> hide={<%= hide %>} <% } %>
              />
            )
          }
          `,
        },
      ],
      renderConditions: [renderWithPageTab('Overview')],
      hasControl: true,
      controls: [
        CCK_CONTROL.type(),
        CCK_CONTROL.size(),
        CCK_CONTROL.color(),
        CCK_CONTROL.additional(),
        CCK_CONTROL.customText('Content', '2'),
        CCK_CONTROL.customNumber('Max', 10),
        CCK_CONTROL.customBoolean('Hide', false),
      ],
    },
  },
  args: {},
  render: (args) => (
    <Badge
      {...reactThemeArgsToTemplate(args)}
      max={args.cckControl.max}
      content={args.cckControl.content}
      hide={args.cckControl.hide}
    ></Badge>
  ),
};
