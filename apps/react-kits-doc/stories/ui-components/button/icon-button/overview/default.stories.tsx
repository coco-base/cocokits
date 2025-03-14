import { IconButton } from '@cocokits/react-button';
import { SvgIcon } from '@cocokits/react-icon';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { reactThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Default: StoryObj<typeof IconButton> = {
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
          import { IconButton, SvgIcon } from '@cocokits/react-components';

          export const MyComponent = () => {
            return (
              <IconButton
                <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
                <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
                <% if (disabled) { %> disabled={true} <% } %>
              >
                <SvgIcon icon="YOUR_ICON"/>
              </IconButton>
            )
          }
          `,
        },
      ],
      renderConditions: [renderWithPageTab('Overview')],
      hasControl: true,
      controls: [
        CCK_CONTROL.type(),
        CCK_CONTROL.color(),
        CCK_CONTROL.size(),
        CCK_CONTROL.additional(),
        CCK_CONTROL.icon('heartFill'),
        CCK_CONTROL.disabled(),
      ],
    },
  },
  args: {},
  render: (args) => (
    <IconButton {...reactThemeArgsToTemplate(args)} disabled={args.cckControl.disabled}>
      <SvgIcon icon={args.cckIcons[args.cckControl.icon]} />
    </IconButton>
  ),
};
