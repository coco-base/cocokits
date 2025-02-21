import { SvgIcon } from '@cocokits/react-icon';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { reactThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Default: StoryObj<typeof SvgIcon> = {
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
                     import { SvgIcon } from "@cocokits/react-components";
  
            export const MyComponent = () => {
              return (
                <>
            <SvgIcon
              <% if (typeof type !== 'undefined') { %> type="<%= type %>" <% } %>
              <% if (typeof size !== 'undefined') { %> size="<%= size %>" <% } %>
              <% if (typeof color !== 'undefined') { %> color="<%= color %>" <% } %>
              icon={YOUR_ICON}
            />
                </>
              );
            }

          `,
        },
      ],
      hasControl: true,
      controls: [CCK_CONTROL.icon('heartFill'), CCK_CONTROL.type(), CCK_CONTROL.color(), CCK_CONTROL.size()],
    },
  },
  render: (args) => <SvgIcon {...reactThemeArgsToTemplate(args)} icon={args.cckIcons[args.cckControl.icon]} />,
};
