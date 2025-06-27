import { SelectComponent } from '@cocokits/angular-form-field';
import { CCK_CONTROL, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Color: StoryObj<SelectComponent> = {
  name: 'Color',
  parameters: {
    docs: {
      description: {
        story:
          'The color is adjustable to match the design language or emphasize the Select field in the form',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp('size'), renderWithPageTab('Overview')],
      singleControls: ['type'],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
            <% themeComponentConfig.color.values.map(color => { %>

              <!-- <%= color %> -->
              <cck-form-field
                color="<%= color %>"
                <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
              >
                <cck-label>Favorite food</cck-label>
                <cck-select placeholder="Favorite food">
                  <cck-option value="Steak">Steak</cck-option>
                  <cck-option value="Pizza">Pizza</cck-option>
                  <cck-option value="Burger">Burger</cck-option>
                </cck-select>
              </cck-form-field>
            <% }) %>
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
      @for (color of cckControl.themeComponentConfig.color.values; let col = $index; track color) {
        <cck-form-field style="width: 100%">
          <cck-label>Select - {{color}}</cck-label>
          <cck-select placeholder="Favorite food" [color]="color" [type]="cckControl.type">
            <cck-option value="Steak">Steak</cck-option>
            <cck-option value="Pizza">Pizza</cck-option>
            <cck-option value="Burger">Burger</cck-option>
          </cck-select>
        </cck-form-field>
      }
    `,
  }),
};
