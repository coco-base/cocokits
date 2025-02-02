import { FormField, Input, Label } from '@cocokits/react-form-field';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { reactThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Default: StoryObj<typeof Input> = {
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
          <FormField>
            <% if (label) { %>
              <Label><%= label %></Label>
            <% } %>
            <Input
              <% if (type) { %> type='<%= type %>' <% } %>
              <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
              <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
              <% if (required) { %> required <% } %>
              <% if (disabled) { %> disabled <% } %>
              <% if (invalid) { %> invalid <% } %>
              <% if (placeholder) { %> placeholder="<%= placeholder %>" <% } %>
            />
          </FormField>
            `,
        },
      ],
      hasControl: true,
      controls: [
        CCK_CONTROL.label(),
        CCK_CONTROL.placeholder(),
        CCK_CONTROL.inputNativeType(),
        CCK_CONTROL.color(),
        CCK_CONTROL.size(),
        CCK_CONTROL.additional(),
        CCK_CONTROL.disabled(),
        CCK_CONTROL.required(),
        CCK_CONTROL.invalid(),
      ],
    },
  },
  render: (args) => (
    <FormField>
      {args.cckControl.label && <Label>{args.cckControl.label}</Label> }
      <Input
        {...reactThemeArgsToTemplate(args)}
        placeholder={args.cckControl.placeholder}
        required={args.cckControl.required}
        disabled={args.cckControl.disabled}
        invalid={args.cckControl.invalid}
      />
    </FormField>
  )
};
