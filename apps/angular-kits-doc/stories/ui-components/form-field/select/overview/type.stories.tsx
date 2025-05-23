import { SelectComponent } from '@cocokits/angular-form-field';
import { CCK_CONTROL, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Type: StoryObj<SelectComponent> = {
  name: 'Type',
  parameters: {
    docs: {
      description: {
        story:
          'The `type` property customizes the visual style of the select component, allowing for different appearances such as filled, outline, etc.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp('type'), renderWithPageTab('Overview')],
      singleControls: ['size'],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
            <% themeComponentConfig.type.values.map(type => { %>
              <!-- <%= type %> -->
              <cck-form-field
                type="<%= type %>"
                <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
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
      controls: [CCK_CONTROL.size()],
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      @for (type of cckControl.themeComponentConfig.type.values; track type) {
        <cck-form-field [type]="type" style="width: 100%">
          <cck-label>Select - {{type}}</cck-label>
          <cck-select placeholder="Favorite food" [size]="cckControl.size">
            <cck-option value="Steak">Steak</cck-option>
            <cck-option value="Pizza">Pizza</cck-option>
            <cck-option value="Burger">Burger</cck-option>
          </cck-select>
        </cck-form-field>
      }
    `,
  }),
};
