import { AngularStoryObj } from '@cocokits/internal-model';
import { AddonParametersControlType, ngThemeArgsToTemplate, renderWithPageTab } from '@cocokits/storybook-addon-theme';

import { ButtonComponent } from '../../src/lib/button/button.component';

export const Default: AngularStoryObj<ButtonComponent> = {
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
            cck-button
            type="<%= type %>"
            size="<%= size %>"
            color="<%= color %>"
            <% if (disabled) { %> disabled <% } %>>
              <% if (leftIcon !== 'none') { %>
                <cck-svg-icon [icon]="YOUR_ICON"></cck-svg-icon>
              <% } %>
              <%= text %>
              <% if (rightIcon !== 'none') { %>
                <cck-svg-icon [icon]="YOUR_ICON"></cck-svg-icon>
              <% } %>
          </button>
          `,
        },
      ],
      hasControl: true,
      controls: [
        { displayName: 'Text', default: 'Button', storyArgKey: 'text', type: AddonParametersControlType.Text },
        {
          displayName: 'Left Icon',
          default: 'heartFill',
          icons: ['none', 'heartFill', 'heart', 'link'],
          storyArgKey: 'leftIcon',
          type: AddonParametersControlType.Icon,
        },
        {
          displayName: 'Right Icon',
          default: 'none',
          icons: ['none', 'heartFill', 'heart', 'link'],
          storyArgKey: 'rightIcon',
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
          cck-button
          ${ngThemeArgsToTemplate(args)}
          [disabled]="cckControl.disabled">
            @if(cckControl.leftIcon !== 'none') {
              <cck-svg-icon [icon]="cckIcons[cckControl.leftIcon]"></cck-svg-icon>
            }
            {{cckControl.text}}
            @if(cckControl.rightIcon !== 'none') {
              <cck-svg-icon [icon]="cckIcons[cckControl.rightIcon]"></cck-svg-icon>
            }
          </button>
      `,
    };
  },
};
