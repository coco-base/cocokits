import { AddonParametersControlType, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { ngThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-angular';

import { ToggleComponent } from '../../src/lib/toggle/toggle.component';

export const Default: StoryObj<ToggleComponent> = {
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
            <cck-toggle
              <% if (checked) { %> [checked]='<%= checked %>' <% } %>
              labelPosition="<%= labelPosition %>"
              <% if(disabled) { %> disabled <% } %>
              <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
              <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
              <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
            >
              <%= text %>
            </cck-toggle>
          `,
        },
      ],
      hasControl: true,
      controls: [
        { displayName: 'Text', default: 'Slide Me!', storyArgKey: 'text', type: AddonParametersControlType.Text },
        {
          displayName: 'Label Position',
          default: 'before',
          options: ['before', 'after'],
          storyArgKey: 'labelPosition',
          type: AddonParametersControlType.Select,
        },
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
      <cck-toggle
        [checked]="cckControl.checked"
        [labelPosition]="cckControl.labelPosition"
        [disabled]="cckControl.disabled"
        ${ngThemeArgsToTemplate(args)}>
        {{cckControl.text}}
      </cck-toggle>
    `,
  }),
};
