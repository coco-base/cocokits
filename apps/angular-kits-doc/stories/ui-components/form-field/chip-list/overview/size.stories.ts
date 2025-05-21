import { ChipListComponent } from '@cocokits/angular-form-field';
import { AddonParametersControlType, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Size: StoryObj<ChipListComponent> = {
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
            <cck-form-field
              <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
              <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
              <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
            >
              <cck-label>Chip List</cck-label>
              <cck-chip-list [chips]="['Steak', 'Pizza', 'Burger']" placeholder="Add a New Food" [addOnBlur]="true">
              </cck-chip-list>
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
      chips: ['Steak', 'Pizza'],
    },
    template: `
      @for (size of cckControl.themeComponentConfig.size.values; let col = $index; track size) {
        <cck-form-field [size]="size" [type]="cckControl.type">
          <cck-label>Chip List</cck-label>
          <cck-chip-list [chips]="chips" [placeholder]="'Add a new food'" [addOnBlur]="true">
          </cck-chip-list>
        </cck-form-field>
      }
    `,
  }),
};
