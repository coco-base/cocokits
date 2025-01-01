import { AngularStoryObj } from '@cocokits/internal-model';
import { AddonParametersControlType, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';

import { DividerComponent } from '../../src/lib/divider/divider.component';

export const Size: AngularStoryObj<DividerComponent> = {
  name: 'Size',
  parameters: {
    docs: {
      description: {
        story:
          'The size is adjustable to suit different design needs and screen dimensions, improving both aesthetics and usability.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Overview'), renderWithThemeProp('size')],
      singleControls: ['type'],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
            <% themeComponentConfig.size.values.map(size => { %>
              <cck-divider
                <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                size="<%= size %>">
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
      @for (size of cckControl.themeComponentConfig.size.values; let col = $index; track size) {
        <cck-divider style="margin: 0 auto; min-height: inherit" [type]="cckControl.type" [size]="size"></cck-divider>
      }
    `,
  }),
};
