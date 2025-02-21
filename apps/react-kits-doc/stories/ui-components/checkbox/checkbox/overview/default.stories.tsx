import { Checkbox } from '@cocokits/react-checkbox';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { reactThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Default: StoryObj<typeof Checkbox> = {
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
           
            import { Checkbox } from "@cocokits/react-components";
  
            export const MyComponent = () => {
              return (
                <>
                   <Checkbox
                      <% if (typeof type !== 'undefined') { %> type="<%= type %>" <% } %>
                      <% if (typeof size !== 'undefined') { %> size="<%= size %>" <% } %>
                      <% if (typeof color !== 'undefined') { %> color="<%= color %>" <% } %>
                      <% if (indeterminate) { %> indeterminate <% } %>
                      <% if (disabled) { %> disabled <% } %>
                      <% if (checked) { %> checked <% } %>
                      value="YOUR_VALUE"
                    />
                </>
              );
            }
          `,
        },
      ],
      hasControl: true,
      controls: [
        CCK_CONTROL.indeterminate(),
        CCK_CONTROL.checked(),
        CCK_CONTROL.disabled(),
        CCK_CONTROL.text('Checkbox Label'),
        CCK_CONTROL.type(),
        CCK_CONTROL.color(),
        CCK_CONTROL.size(),
        CCK_CONTROL.additional(),
      ],
    },
  },
  render: (args) => (
    <Checkbox
      {...reactThemeArgsToTemplate(args)}
      indeterminate={args.cckControl.indeterminate}
      checked={args.cckControl.checked}
      disabled={args.cckControl.disabled}>
      {args.cckControl.text}
    </Checkbox>
  ),
};
