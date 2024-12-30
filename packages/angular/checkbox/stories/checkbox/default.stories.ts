import { AngularStoryObj } from '@cocokits/internal-model';
import { AddonParametersControlType, ngThemeArgsToTemplate, renderWithPageTab } from '@cocokits/storybook-addon-theme';

import { CheckboxComponent } from '../../src/lib/checkbox/checkbox.component';

export const Default: AngularStoryObj<CheckboxComponent> = {
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
            <cck-checkbox
              <% if (indeterminate) { %> indeterminate="<%= indeterminate %>" <% } %>
              <% if (typeof type !== 'undefined') { %> type="<%= type %>" <% } %>
              <% if (typeof size !== 'undefined') { %> size="<%= size %>" <% } %>
              <% if (typeof color !== 'undefined') { %> color="<%= color %>" <% } %>
              value="YOUR_VALUE"
            >
              <%= text %>
            </cck-checkbox>
          `,
        },
      ],
      hasControl: true,
      controls: [
        {
          displayName: 'Indeterminate',
          default: false,
          storyArgKey: 'indeterminate',
          type: AddonParametersControlType.Boolean,
        },
        { displayName: 'Text', default: 'Checkbox Label', storyArgKey: 'text', type: AddonParametersControlType.Text },
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
      <cck-checkbox
        [indeterminate]="cckControl.indeterminate"
        ${ngThemeArgsToTemplate(args)}
      >
        {{cckControl.text}}
      </cck-checkbox>
    `,
  }),
};
