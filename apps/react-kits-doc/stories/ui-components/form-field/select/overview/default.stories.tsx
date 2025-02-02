import { ElementAnchorPoint } from '@cocokits/common-utils';
import { FormField, Label, Option, Select } from '@cocokits/react-form-field';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { reactThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Default: StoryObj<typeof Select> = {
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
              <Select
                <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
                <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
                <% if (placeholder) { %> placeholder='<%= placeholder %>' <% } %>
                <% if (disabled) { %> disabled <% } %>
                <% if (required) { %> required <% } %>
                <% if (invalid) { %> invalid <% } %>
                <% if (multiple) { %> multiple <% } %>
                <% if (anchorPoint) { %> anchorPoint='<%= anchorPoint %>' <% } %>
                <% if (typeof maxOptionsHeight === 'number') { %> maxOptionsHeight='<%= maxOptionsHeight %>' <% } %>
              >
                <Option value="Steak">Steak</Option>
                <Option value="Pizza">Pizza</Option>
                <Option value="Burger">Burger</Option>
              </Select>
            </FormField>
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
        CCK_CONTROL.anchorPoint(ElementAnchorPoint.BottomLeft),
        CCK_CONTROL.maxOptionsHeight(),
        CCK_CONTROL.disabled(),
        CCK_CONTROL.multiple(),
        CCK_CONTROL.required(),
        CCK_CONTROL.invalid(),
      ],
    },
  },
  render: (args) => (
    <FormField>
      {args.cckControl.label && <Label>{args.cckControl.label}</Label>}
      <Select
        {...reactThemeArgsToTemplate(args)}
        placeholder={args.cckControl.placeholder}
        disabled={args.cckControl.disabled}
        required={args.cckControl.required}
        invalid={args.cckControl.invalid}
        multiple={args.cckControl.multiple}
        anchorPoint={args.cckControl.anchorPoint}
        maxOptionsHeight={args.cckControl.maxOptionsHeight}
      >
        <Option value="Steak">Steak</Option>
        <Option value="Pizza">Pizza</Option>
        <Option value="Burger">Burger</Option>
      </Select>
    </FormField>
  ),
};
