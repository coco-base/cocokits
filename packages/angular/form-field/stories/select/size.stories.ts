import { AddonParametersControlType, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

import { SelectComponent } from '../../src/lib/select/select.component';

export const Size: StoryObj<SelectComponent> = {
  name: 'Size',
  parameters: {
    docs: {
      description: {
        story:
          'The size is adjustable to suit different design needs and screen dimensions, improving both aesthetics and usability.',
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
            <% themeComponentConfig.size.values.map(size => { %>

              <!-- <%= size %> -->
              <cck-form-field
                size="<%= size %>"
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
      controls: [{ prop: 'type', type: AddonParametersControlType.SelectThemeConfig }],
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      @for (size of cckControl.themeComponentConfig.size.values; let col = $index; track size) {
        <cck-form-field style="width: 100%">
          <cck-label>Select - {{size}}</cck-label>
          <cck-select placeholder="Favorite food" [size]="size" [type]="cckControl.type">
            <cck-option value="Steak">Steak</cck-option>
            <cck-option value="Pizza">Pizza</cck-option>
            <cck-option value="Burger">Burger</cck-option>
          </cck-select>
        </cck-form-field>
      }
    `,
  }),
};
