import { AddonParametersControlType, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

import { ChipComponent } from '../../src/lib/chip/chip.component';

export const Size: StoryObj<ChipComponent> = {
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
            <cck-chip
              size="<%= size %>"
              <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
            >
              Chip Value
            </cck-chip>
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
       @for (size of cckControl.themeComponentConfig?.size?.values; let col = $index; track size) {
        <cck-chip [size]="size" [type]="cckControl.type">Chip - {{size}}</cck-chip>
      }  
    `,
  }),
};
