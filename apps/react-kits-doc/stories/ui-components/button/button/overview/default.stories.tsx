import { Button } from "@cocokits/react-button";
import { SvgIcon } from "@cocokits/react-icon";
import { CCK_CONTROL, renderWithPageTab } from "@cocokits/storybook-addon-theme";
import { reactThemeArgsToTemplate, StoryObj } from "@cocokits/storybook-addon-theme-react";

export const Default: StoryObj<typeof Button> = {
  name: "Default",
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
          import { Button, SvgIcon} from '@cocokits/react-components';

          export const MyComponent = () => {
            return (
              <Button
                <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
                <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
                <% if (disabled) { %> disabled <% } %>
              >
                <% if (leftIcon !== 'none') { %>
                  <SvgIcon icon="YOUR_ICON"/>
                <% } %>
                <%= text %>
                <% if (rightIcon !== 'none') { %>
                  <SvgIcon icon="YOUR_ICON"/>
                <% } %>
              </Button>
            )
          }
          `,
        },
      ],
      renderConditions: [renderWithPageTab('Overview')],
      hasControl: true,
      controls: [
        CCK_CONTROL.text('Button'),
        CCK_CONTROL.leftIcon('heartFill'),
        CCK_CONTROL.rightIcon('none'),
        CCK_CONTROL.type(),
        CCK_CONTROL.color(),
        CCK_CONTROL.size(),
        CCK_CONTROL.additional(),
        CCK_CONTROL.disabled(),
      ]
    }
  },
  args: {
  },
  render: (args) => (
    <Button
      {...reactThemeArgsToTemplate(args)}
      disabled={args.cckControl.disabled}
    >
      { args.cckControl.leftIcon !== 'none' && <SvgIcon icon={args.cckIcons[args.cckControl.leftIcon]} /> }
      {args.cckControl.text}
      { args.cckControl.rightIcon !== 'none' && <SvgIcon icon={args.cckIcons[args.cckControl.rightIcon]} /> }
    </Button>
  )
};
