import { FormField, Label, Option, Select, SelectPreview } from '@cocokits/react-form-field';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { reactThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-react';

export const CustomPreview: StoryObj<typeof Select> = {
  name: 'CustomPreview',
  parameters: {
    docs: {
      description: {
        story:
          'Displays the select component with a customized view for the selected item, enabling more complex and visually rich representations instead of just plain text.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Overview')],
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
                     import { FormField, Label, Option, Select } from "@cocokits/react-components";
  
            export const MyComponent = () => {
              return (
                <>
      <FormField>
               <% if (label) { %>
                <Label><%= label %></Label>
              <% } %>
              <Select
                <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
                <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
                placeholder="Add a new food"
                multiple
                selectPreview={(selected: string[]) => (
                  <SelectPreview>
                    {selected[0]}
                    {selected.length > 1 && <span style={{ opacity: 0.5 }}> (+{selected.length - 1} more)</span>}
                  </SelectPreview>
                )}>

              <Option value="Steak">Steak</Option>
              <Option value="Pizza">Pizza</Option>
              <Option value="Burger">Burger</Option>
              <Option value="Salad">Salad</Option>
              <Option value="Sushi">Sushi</Option>
              <Option value="Soup">Soup</Option>
              <Option value="IceCream">Ice Cream</Option>
              <Option value="Cake">Cake</Option>
              <Option value="Pie">Pie</Option>

              </Select>
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
        CCK_CONTROL.type(),
        CCK_CONTROL.color(),
        CCK_CONTROL.size(),
        CCK_CONTROL.additional(),
      ],
    },
  },
  render: (args) => (
    <FormField style={{ minWidth: '200px' }}>
      {args.cckControl.label && <Label>{args.cckControl.label}</Label>}
      <Select
        {...reactThemeArgsToTemplate(args)}
        placeholder="Add a new food"
        multiple
        selectPreview={(selected: string[]) => (
          <SelectPreview>
            {selected[0]}
            {selected.length > 1 && <span style={{ opacity: 0.5 }}> (+{selected.length - 1} more)</span>}
          </SelectPreview>
        )}>
        <Option value="Steak">Steak</Option>
        <Option value="Pizza">Pizza</Option>
        <Option value="Burger">Burger</Option>
        <Option value="Salad">Salad</Option>
        <Option value="Sushi">Sushi</Option>
        <Option value="Soup">Soup</Option>
        <Option value="IceCream">Ice Cream</Option>
        <Option value="Cake">Cake</Option>
        <Option value="Pie">Pie</Option>
      </Select>
    </FormField>
  ),
};
