import { RadioButton } from '@cocokits/react-components';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { reactThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Default: StoryObj<typeof RadioButton> = {
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
            <RadioButton
              <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
              <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
              <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
              <% if (disabled) { %> disabled <% } %>
              <% if (checked) { %> checked <% } %>
              value='YOUR_VALUE'
              >
              <%= text %>
            </RadioButton>
          `,
        },
      ],
      hasControl: true,
      controls: [
        CCK_CONTROL.text('Label'),
        CCK_CONTROL.type(),
        CCK_CONTROL.color(),
        CCK_CONTROL.size(),
        CCK_CONTROL.additional(),
        CCK_CONTROL.disabled(),
        CCK_CONTROL.checked(true),
      ],
    },
  },
  render: (args) => (
    <>
      <RadioButton
        {...reactThemeArgsToTemplate(args)}
        checked={args.cckControl.checked}
        disabled={args.cckControl.disabled}
        value={1}>
        {args.cckControl.text}
      </RadioButton>
    </>
  )
};
