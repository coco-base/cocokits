import { ChipListComponent } from '@cocokits/angular-form-field';
import { renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Color: StoryObj<ChipListComponent> = {
  name: 'Color',
  parameters: {
    docs: {
      description: {
        story:
          'The color is adjustable to suit different design needs and screen dimensions, improving both aesthetics and usability.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp('color'), renderWithPageTab('Overview')],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
            <% themeComponentConfig.color.values.map(color => { %>
              <button
                cck-button
                <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
              >
                <%= color %>
                </button>
            <% }) %>
          `,
        },
      ],
    },
  },
  render: (args) => ({
    props: {
      ...args,
      chips: ['Steak', 'Pizza'],
    },
    template: `
      @for (color of cckControl.themeComponentConfig.color.values; let col = $index; track color) {
        <cck-form-field  [color]="color" [type]="cckControl.type">
          <cck-label>Chip List</cck-label>
          <cck-chip-list [chips]="chips" [placeholder]="'Add a new food'" [addOnBlur]="true">
          </cck-chip-list>
        </cck-form-field>
      }
    `,
  }),
};
