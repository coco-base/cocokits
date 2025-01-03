import { AddonParametersControlType, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { ngThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-angular';

import { SvgIconComponent } from '../../src';

export const Default: StoryObj<SvgIconComponent> = {
  name: 'Default',
  parameters: {
    docs: {
      description: {
        story:
          'Shows the default example with no additional configurations, providing an interactive example in its most basic form.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Overview')],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
            <cck-svg-icon
              [icon]="YOUR)ICON"
              <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
              <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
              <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
            >
            </cck-svg-icon>
          `,
        },
      ],
      hasControl: true,
      controls: [
        {
          displayName: 'Icon',
          default: 'heartFill',
          icons: ['none', 'heartFill', 'heart', 'link'],
          storyArgKey: 'icon',
          type: AddonParametersControlType.Icon,
        },
        { prop: 'type', type: AddonParametersControlType.SelectThemeConfig },
        { prop: 'color', type: AddonParametersControlType.SelectThemeConfig },
        { prop: 'size', type: AddonParametersControlType.SelectThemeConfig },
        { prop: 'additional', type: AddonParametersControlType.SelectThemeConfig },
      ],
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <cck-svg-icon
        [icon]="cckIcons[cckControl.icon]"
        ${ngThemeArgsToTemplate(args)}
      >
      </cck-svg-icon>
    `,
  }),
};
