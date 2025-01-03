import { AddonParametersControlType, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

import { SvgIconComponent } from '../../src';

export const Color: StoryObj<SvgIconComponent> = {
  name: 'Color',
  parameters: {
    docs: {
      description: {
        story: 'Color options enable seamless integration with various themes or to highlight specific actions.',
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
            <cck-svg-icon
              [icon]="YOUR_ICON"
              [color]="<%= color %>"
              <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
            >
            </cck-svg-icon>
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
        <cck-svg-icon [icon]="cckIcons.heartFill" [color]="color" [type]="cckControl.type"></cck-svg-icon>
      }
    `,
  }),
};
