import { AngularStoryObj } from '@cocokits/internal-model';
import { AddonParametersControlType, ngThemeArgsToTemplate, renderWithPageTab } from '@cocokits/storybook-addon-theme';

import { InputComponent } from '../../src/lib/input/input.component';

export const Default: AngularStoryObj<InputComponent> = {
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
          <cck-form-field>
              <cck-label><%= label %></cck-label>
              <input
                cckInput
                <% if (type) { %> type='<%= type %>' <% } %>
                <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
                <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
                <% if (required) { %> required <% } %>
                <% if (disabled) { %> disabled <% } %>
                <% if (placeholder) { %> placeholder="<%= placeholder %>" <% } %>
              />
            </cck-form-field>
            `,
        },
      ],
      hasControl: true,
      controls: [
        {
          displayName: 'Label',
          default: 'Label',
          storyArgKey: 'label',
          type: AddonParametersControlType.Text,
        },
        {
          displayName: 'Placeholder',
          default: 'Placeholder',
          storyArgKey: 'placeholder',
          type: AddonParametersControlType.Text,
        },
        {
          displayName: 'Type',
          default: '',
          options: [
            'color',
            'date',
            'datetime-local',
            'email',
            'month',
            'number',
            'password',
            'search',
            'text',
            'time',
            'week',
          ],
          storyArgKey: 'type',
          type: AddonParametersControlType.Select,
        },
        { prop: 'color', type: AddonParametersControlType.SelectThemeConfig },
        { prop: 'size', type: AddonParametersControlType.SelectThemeConfig },
        { prop: 'additional', type: AddonParametersControlType.SelectThemeConfig },
        { displayName: 'Disabled', default: false, storyArgKey: 'disabled', type: AddonParametersControlType.Boolean },
        { displayName: 'Required', default: false, storyArgKey: 'required', type: AddonParametersControlType.Boolean },
      ],
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <cck-form-field style="width: 100%">
          <cck-label>{{cckControl.label}}</cck-label>
          <input
            cckInput
            [placeholder]="cckControl.placeholder"
            [required]="cckControl.required"
            [disabled]="cckControl.disabled"
            ${ngThemeArgsToTemplate(args)}
          />
      </cck-form-field>
    `,
  }),
};
