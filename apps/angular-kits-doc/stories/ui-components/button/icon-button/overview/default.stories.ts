import { IconButtonComponent } from '@cocokits/angular-button';
import { AddonParametersControlType, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { ngThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Default: StoryObj<IconButtonComponent> = {
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
              <button
                cck-icon-button
                <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
                <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
                <% if (disabled) { %> disabled <% } %>>
                  <cck-svg-icon [icon]="YOUR_ICON"></cck-svg-icon>
              </button>
              `,
        },
      ],
      hasControl: true,
      controls: [
        {
          displayName: 'Icon',
          default: 'heartFill',
          icons: ['info', 'heartFill', 'heart', 'link'],
          storyArgKey: 'icon',
          type: AddonParametersControlType.Icon,
        },
        { prop: 'type', type: AddonParametersControlType.SelectThemeConfig },
        { prop: 'color', type: AddonParametersControlType.SelectThemeConfig },
        { prop: 'size', type: AddonParametersControlType.SelectThemeConfig },
        { prop: 'additional', type: AddonParametersControlType.SelectThemeConfig },
        { displayName: 'Disabled', default: false, storyArgKey: 'disabled', type: AddonParametersControlType.Boolean },
      ],
    },
  },
  render: (args) => {
    return {
      props: {
        ...args,
      },
      template: `
      <button
        cck-icon-button
        [disabled]="cckControl.disabled"
        ${ngThemeArgsToTemplate(args)}>
          <cck-svg-icon [icon]="cckIcons[cckControl.icon]"></cck-svg-icon>
      </button>
    `,
    };
  },
};
