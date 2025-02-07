import { FormField, Label, Option, OptionGroup, Select } from '@cocokits/react-form-field';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { reactThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Options: StoryObj<typeof Select> = {
  name: 'Options',
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
                placeholder='Add a new food'
                <% if (multiple) { %> multiple <% } %>
              >

              <OptionGroup label='Fast Foods'>
                <Option value="Steak">Steak</Option>
                <Option value="Pizza" disabled>Pizza</Option>
                <Option value="Burger">Burger</Option>
              </OptionGroup>

              <OptionGroup label='Healthy Options'>
                <Option value="Salad">Salad</Option>
                <Option value="Sushi">Sushi</Option>
                <Option value="Soup" disabled>Soup</Option>
              </OptionGroup>

              <OptionGroup label="Desserts" disabled>
                <Option value="ice-cream">Ice Cream</Option>
                <Option value="cake">Cake</Option>
                <Option value="pie">Pie</Option>
              </OptionGroup>

              </Select>
            </FormField>
            `,
        },
      ],
      hasControl: true,
      controls: [
        CCK_CONTROL.label('Favorite Foods'),
        CCK_CONTROL.type(),
        CCK_CONTROL.color(),
        CCK_CONTROL.size(),
        CCK_CONTROL.additional(),
        CCK_CONTROL.multiple()
      ],
    },
  },
  render: (args) => (
    <FormField style={{ minWidth: '200px' }}>
      {args.cckControl.label && <Label>{args.cckControl.label}</Label>}
      <Select
        {...reactThemeArgsToTemplate(args)}
        placeholder='Add a new food'
        multiple={args.cckControl.multiple}
        maxOptionsHeight={300}
      >
        <OptionGroup label='Fast Foods'>
          <Option value="Steak">Steak</Option>
          <Option value="Pizza" disabled>Pizza</Option>
          <Option value="Burger">Burger</Option>
        </OptionGroup>

        <OptionGroup label='Healthy Options'>
          <Option value="Salad">Salad</Option>
          <Option value="Sushi">Sushi</Option>
          <Option value="Soup" disabled>Soup</Option>
        </OptionGroup>

        <OptionGroup label="Desserts" disabled>
          <Option value="ice-cream">Ice Cream</Option>
          <Option value="cake">Cake</Option>
          <Option value="pie">Pie</Option>
        </OptionGroup>
      </Select>
    </FormField>
  ),
};
