import { AngularStoryObj } from '@cocokits/internal-model';
import { AddonParametersControlType, ngThemeArgsToTemplate, renderWithPageTab } from '@cocokits/storybook-addon-theme';

import { SelectComponent } from '../../src/lib/select/select.component';

export const Default: AngularStoryObj<SelectComponent> = {
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
              <% if (label) { %>
                <cck-label><%= label %></cck-label>
              <% } %>

              <cck-select
                <% if (placeholder) { %> placeholder="<%= placeholder %>" <% } %>
                <% if (multiple) { %> [multiple]="<%= multiple %>" <% } %>
                <% if (disabled) { %> disabled <% } %>
                <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
                <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
              >
                <cck-option [value]="'Steak'">Steak</cck-option>
                <cck-option [value]="'Pizza'">Pizza</cck-option>
                <cck-option [value]="'Burger'">Burger</cck-option>
              </cck-select>
            </cck-form-field>
            `,
        },
      ],
      hasControl: true,
      controls: [
        {
          displayName: 'Label',
          default: 'Favorite Foods',
          storyArgKey: 'label',
          type: AddonParametersControlType.Text,
        },
        {
          displayName: 'Placeholder',
          default: 'Add a new food',
          storyArgKey: 'placeholder',
          type: AddonParametersControlType.Text,
        },
        { prop: 'type', type: AddonParametersControlType.SelectThemeConfig },
        { prop: 'color', type: AddonParametersControlType.SelectThemeConfig },
        { prop: 'size', type: AddonParametersControlType.SelectThemeConfig },
        { prop: 'additional', type: AddonParametersControlType.SelectThemeConfig },
        { displayName: 'Disabled', default: false, storyArgKey: 'disabled', type: AddonParametersControlType.Boolean },
        { displayName: 'Multiple', default: false, storyArgKey: 'multiple', type: AddonParametersControlType.Boolean },
      ],
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
       <cck-form-field style="width: 100%">
        @if(cckControl.label) {
          <cck-label>{{cckControl.label}}</cck-label>
        }
        <cck-select
          placeholder="{{cckControl.placeholder}}"
          [multiple]="cckControl.multiple"
          [disabled]="cckControl.disabled"
          ${ngThemeArgsToTemplate(args)}
        >
          <cck-option [value]="'Steak'">Steak</cck-option>
          <cck-option [value]="'Pizza'">Pizza</cck-option>
          <cck-option [value]="'Burger'">Burger</cck-option>
        </cck-select>
      </cck-form-field>
    `,
  }),
};
