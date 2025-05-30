import { ChipList, FormField, Label } from '@cocokits/react-components';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { reactThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Default: StoryObj<typeof ChipList> = {
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
            import { FormField, Label, ChipList } from "@cocokits/react-components";
  
            export const MyComponent = () => {
              return (
                <>
                  <FormField>
                    <Label><%= label %></Label>
                    <ChipList
                      chips={['Steak', 'Pizza']}
                      <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                      <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
                      <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
                      <% if (disabled) { %> disabled <% } %>
                      placeholder="<%= placeholder %>"
                      addOnBlur={<%= addOnBlur %>}
                    >
                    </ChipList>
                  </FormField>
                </>
              );
            }
            `,
        },
      ],
      hasControl: true,
      controls: [
        CCK_CONTROL.label('Favorite Foods'),
        CCK_CONTROL.placeholder('Add a new food'),
        CCK_CONTROL.type(),
        CCK_CONTROL.color(),
        CCK_CONTROL.size(),
        CCK_CONTROL.additional(),
        CCK_CONTROL.disabled(),
        CCK_CONTROL.addOnBlur(),
      ],
    },
  },
  render: (args) => (
    <FormField>
      <Label>{args.cckControl.label}</Label>
      <ChipList
        {...reactThemeArgsToTemplate(args)}
        chips={['Steak', 'Pizza']}
        placeholder={args.cckControl.placeholder}
        addOnBlur={args.cckControl.addOnBlur}
        disabled={args.cckControl.disabled}
      />
    </FormField>
  ),
};
