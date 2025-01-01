import { AngularStoryObj } from '@cocokits/internal-model';
import { AddonParametersControlType, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';

import { DividerComponent } from '../../src/lib/divider/divider.component';

export const Color: AngularStoryObj<DividerComponent> = {
  name: 'Color',
  parameters: {
    docs: {
      description: {
        story: 'Color options enable seamless integration with various themes or to highlight specific actions.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Overview'), renderWithThemeProp('color')],
      singleControls: ['type'],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
            <% themeComponentConfig.color.values.map(color => { %>
              <cck-divider
                <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                color="<%= color %>">
              </cck-divider>
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
      @for (color of cckControl.themeComponentConfig.color.values; let col = $index; track color) {
        <cck-divider style="margin: 0 auto; min-height: inherit" [type]="cckControl.type" [color]="color"></cck-divider>
      }
    `,
  }),
};
