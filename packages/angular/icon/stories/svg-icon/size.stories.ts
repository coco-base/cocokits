import { AddonParametersControlType, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

import { SvgIconComponent } from '../../src';

export const Size: StoryObj<SvgIconComponent> = {
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
            <cck-svg-icon
              [icon]="YOUR_ICON"
              [size]="<%= size %>"
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
      @for (size of cckControl.themeComponentConfig.size.values; let col = $index; track size) {
        <cck-svg-icon [icon]="cckIcons.heartFill" [size]="size" [type]="cckControl.type"></cck-svg-icon>
      }
    `,
  }),
};
