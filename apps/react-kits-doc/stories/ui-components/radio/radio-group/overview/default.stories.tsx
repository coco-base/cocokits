import { RadioButton, RadioGroup } from '@cocokits/react-components';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { reactThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Default: StoryObj<typeof RadioGroup> = {
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
                     import { RadioButton, RadioGroup } from "@cocokits/react-components";
  
            export const MyComponent = () => {
              return (
                <>
            <RadioGroup
              <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
              <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
              <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
              <% if (selectedRadio !== 'None') { %> selected='<%= selectedRadio %>' <% } %>
              <% if (disabled) { %> disabled <% } %>>
              <RadioButton value="Radio-1">Radio Button 1</RadioButton>
              <RadioButton value="Radio-2">Radio Button 2</RadioButton>
              <RadioButton value="Radio-3">Radio Button 3</RadioButton>
            </RadioGroup>
                </>
              );
            }

          `,
        },
      ],
      hasControl: true,
      controls: [
        CCK_CONTROL.type(),
        CCK_CONTROL.color(),
        CCK_CONTROL.size(),
        CCK_CONTROL.additional(),
        CCK_CONTROL.disabled(),
        CCK_CONTROL.selectedRadio(),
      ],
    },
  },
  render: (args) => (
    <RadioGroup
      {...reactThemeArgsToTemplate(args)}
      disabled={args.cckControl.disabled}
      selected={args.cckControl.selectedRadio}>
      <RadioButton value="Radio-1">Radio Button 1</RadioButton>
      <RadioButton value="Radio-2">Radio Button 2</RadioButton>
      <RadioButton value="Radio-3">Radio Button 3</RadioButton>
    </RadioGroup>
  ),
};
