import { FormField, Label, Textarea } from '@cocokits/react-components';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { reactThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Default: StoryObj<typeof Textarea> = {
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
                     import { FormField, Label, Textarea } from "@cocokits/react-components";
  
            export const MyComponent = () => {
              return (
                <>
<FormField>
              <% if (label) { %>
                <Label><%= label %></Label>
              <% } %>
              
              <Textarea
                <% if (placeholder) { %> placeholder="<%= placeholder %>" <% } %>
                <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
                <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
                <% if (disabled) { %> disabled <% } %>
                <% if (required) { %> required <% } %>
                <% if (invalid) { %> invalid <% } %>
                <% if (autoResize) { %> autoResize <% } %>
                <% if (typeof minRows !== 'undefined') { %> minRows={<%= minRows %>} <% } %>
                <% if (typeof maxRows !== 'undefined') { %> maxRows={<%= maxRows %>} <% } %>
              />
            </FormField>
                </>
              );
            }
            
          `,
        },
      ],
      hasControl: true,
      controls: [
        CCK_CONTROL.label(),
        CCK_CONTROL.placeholder(),
        CCK_CONTROL.minRows(),
        CCK_CONTROL.maxRows(),
        CCK_CONTROL.type(),
        CCK_CONTROL.color(),
        CCK_CONTROL.size(),
        CCK_CONTROL.additional(),
        CCK_CONTROL.autoResize(),
        CCK_CONTROL.disabled(),
        CCK_CONTROL.required(),
        CCK_CONTROL.invalid(),
      ],
    },
  },
  render: (args) => (
    <FormField>
      {args.cckControl.label && <Label>{args.cckControl.label}</Label>}
      <Textarea
        {...reactThemeArgsToTemplate(args)}
        placeholder={args.cckControl.placeholder}
        required={args.cckControl.required}
        disabled={args.cckControl.disabled}
        invalid={args.cckControl.invalid}
        autoResize={args.cckControl.autoResize}
        minRows={args.cckControl.minRows}
        maxRows={args.cckControl.maxRows}
      />
    </FormField>
  ),
};
