import { AddonParametersControlType, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

import { ChipComponent } from '../../src/lib/chip/chip.component';

export const Color: StoryObj<ChipComponent> = {
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
      singleControls: ['type'],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
          <% themeComponentConfig.color.values.map(color => { %>
            <cck-chip
              color="<%= color %>"
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
       @for (color of cckControl.themeComponentConfig?.color?.values; let col = $index; track color) {
        <cck-chip [color]="color" [type]="cckControl.type">Chip - {{color}}</cck-chip>
      }  
    `,
  }),
};
