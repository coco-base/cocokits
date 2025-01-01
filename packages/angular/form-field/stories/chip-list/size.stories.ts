import { AngularStoryObj } from '@cocokits/internal-model';
import { AddonParametersControlType, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';

import { ChipListComponent } from '../../src/lib/chip-list/chip-list.component';

export const Size: AngularStoryObj<ChipListComponent<string>> = {
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
              <button
                cck-button
                <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                size='<%= size %>'
              >
                <%= size %>
                </button>
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
        <cck-form-field style="width: 100%" [size]="size" [type]="cckControl.type">
          <cck-label>Chip List</cck-label>
          <cck-chip-list [chips]="chips" [placeholder]="'Add a new food'" [addOnBlur]="true">
          </cck-chip-list>
        </cck-form-field>
      }
    `,
  }),
};
