import { AngularStoryObj } from '@cocokits/internal-model';
import { AddonParametersControlType, ngThemeArgsToTemplate, renderWithPageTab } from '@cocokits/storybook-addon-theme';

import { RadioButtonComponent } from '../../src/lib/radio/radio.component';

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
            <cck-radio-group
              <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
              <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
              <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
              <% if (selected !== 'None') { %> selected='<%= selected %>' <% } %>
              <% if (disabled) { %> disabled <% } %>
             >
                <cck-radio-button value="Radio-1">Radio Button 1</cck-radio-button>
                <cck-radio-button value="Radio-2">Radio Button 2</cck-radio-button>
                <cck-radio-button value="Radio-3">Radio Button 3</cck-radio-button>
            </cck-radio-group>
          `,
        },
      ],
      hasControl: true,
      controls: [
        { prop: 'type', type: AddonParametersControlType.SelectThemeConfig },
        { prop: 'color', type: AddonParametersControlType.SelectThemeConfig },
        { prop: 'size', type: AddonParametersControlType.SelectThemeConfig },
        { prop: 'additional', type: AddonParametersControlType.SelectThemeConfig },
        { displayName: 'Disabled', default: false, storyArgKey: 'disabled', type: AddonParametersControlType.Boolean },
        {
          displayName: 'Selected',
          default: 'Radio-1',
          options: ['None', 'Radio-1', 'Radio-2', 'Radio-3'],
          storyArgKey: 'selected',
          type: AddonParametersControlType.Select,
        },
      ],
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <cck-radio-group
        [disabled]="cckControl.disabled"
        [selected]="cckControl.selected"
        ${ngThemeArgsToTemplate(args)}>
          <cck-radio-button value="Radio-1">Radio Button 1</cck-radio-button>
          <cck-radio-button value="Radio-2">Radio Button 2</cck-radio-button>
          <cck-radio-button value="Radio-3">Radio Button 3</cck-radio-button>
      </cck-radio-group>
    `,
  }),
};
