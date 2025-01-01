import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { RadioButtonComponent } from '../../src/lib/radio/radio.component';
import { AddonParametersControlType, ngThemeArgsToTemplate, renderWithPageTab } from '@cocokits/storybook-addon-theme';

export const Default: AngularStoryObj<RadioButtonComponent> = {
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
            <cck-radio-button
              [checked]="<%= checked %>"
              <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
              <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
              <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
              <% if (disabled) { %> disabled <% } %>
              [value]="YOUR_VALUE"
            >
              {{cckControl.text}}
            </cck-radio-button>
          `,
        },
      ],
      hasControl: true,
      controls: [
        { displayName: 'Text', default: 'Label', storyArgKey: 'text', type: AddonParametersControlType.Text },
        { prop: 'type', type: AddonParametersControlType.SelectThemeConfig },
        { prop: 'color', type: AddonParametersControlType.SelectThemeConfig },
        { prop: 'size', type: AddonParametersControlType.SelectThemeConfig },
        { prop: 'additional', type: AddonParametersControlType.SelectThemeConfig },
        { displayName: 'Disabled', default: false, storyArgKey: 'disabled', type: AddonParametersControlType.Boolean },
        { displayName: 'Checked', default: false, storyArgKey: 'checked', type: AddonParametersControlType.Boolean },
      ],
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <cck-radio-button
        [checked]="cckControl.checked"
        [disabled]="cckControl.disabled"
        [value]="1"
        ${ngThemeArgsToTemplate(args)}
      >
        {{cckControl.text}}
      </cck-radio-button>
    `,
  }),
};
