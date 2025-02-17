import { SelectComponent } from '@cocokits/angular-form-field';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const OptionGroup: StoryObj<SelectComponent> = {
  name: 'OptionGroup',
  parameters: {
    docs: {
      description: {
        story: `Shows the select component with grouped options, demonstrating how different options can be organized together for improved categorization and user experience.`,
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Overview')],
      singleControls: ['type'],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
            <cck-form-field>
            <cck-label>Favorite Food</cck-label>
            <cck-select
              <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
              [multiple]="true"
              placeholder="Favorite Food"
            >
              <cck-option-group label="Fast Foods">
                <cck-option value="Steak">Steak</cck-option>
                <cck-option value="Pizza">Pizza</cck-option>
                <cck-option value="Burger">Burger</cck-option>
              </cck-option-group>
              <cck-option-group label="Healthy Options">
                <cck-option value="Salad">Salad</cck-option>
                <cck-option value="Sushi">Sushi</cck-option>
                <cck-option value="Soup" disabled>Soup</cck-option>
              </cck-option-group>
              <cck-option-group label="Desserts" disabled>
                <cck-option value="ice-cream">Ice Cream</cck-option>
                <cck-option value="cake">Cake</cck-option>
                <cck-option value="pie">Pie</cck-option>
              </cck-option-group>
            </cck-select>
          </cck-form-field>
          `,
        },
      ],
      controls: [CCK_CONTROL.type()],
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <cck-form-field style="width: 100%">
        <cck-label>Favorite Food</cck-label>
        <cck-select [multiple]="true" placeholder="Favorite Food">
          <cck-option-group label="Fast Foods">
            <cck-option value="Steak">Steak</cck-option>
            <cck-option value="Pizza">Pizza</cck-option>
            <cck-option value="Burger">Burger</cck-option>
          </cck-option-group>
          <cck-option-group label="Healthy Options">
            <cck-option value="Salad">Salad</cck-option>
            <cck-option value="Sushi">Sushi</cck-option>
            <cck-option value="Soup" disabled>Soup</cck-option>
          </cck-option-group>
          <cck-option-group label="Desserts" disabled>
            <cck-option value="ice-cream">Ice Cream</cck-option>
            <cck-option value="cake">Cake</cck-option>
            <cck-option value="pie">Pie</cck-option>
          </cck-option-group>
        </cck-select>
      </cck-form-field>
    `,
  }),
};
