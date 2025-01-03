import { AddonParametersControlType, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { ngThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-angular';

import { TextareaComponent } from '../../src/lib/textarea/textarea.component';

export const Default: StoryObj<TextareaComponent> = {
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
              
              <textarea
                cckTextarea
                <% if (placeholder) { %> placeholder="<%= placeholder %>" <% } %>
                <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
                <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
                <% if (disabled) { %> disabled <% } %>
                <% if (required) { %> required <% } %>
                [autoResize]="<%= autoResize %>"
                [minRows]="<%= minRows %>"
                [maxRows]="<%= maxRows %>"
              />
            </cck-form-field>
          `,
        },
      ],
      hasControl: true,
      controls: [
        { displayName: 'Label', default: 'Label', storyArgKey: 'label', type: AddonParametersControlType.Text },
        {
          displayName: 'Placeholder',
          default: 'Placeholder',
          storyArgKey: 'placeholder',
          type: AddonParametersControlType.Text,
        },

        { displayName: 'Max Rows', default: 5, storyArgKey: 'maxRows', type: AddonParametersControlType.Number },
        { displayName: 'Min Rows', default: 2, storyArgKey: 'minRows', type: AddonParametersControlType.Number },

        { prop: 'type', type: AddonParametersControlType.SelectThemeConfig },
        { prop: 'color', type: AddonParametersControlType.SelectThemeConfig },
        { prop: 'size', type: AddonParametersControlType.SelectThemeConfig },
        { prop: 'additional', type: AddonParametersControlType.SelectThemeConfig },
        { displayName: 'Disabled', default: false, storyArgKey: 'disabled', type: AddonParametersControlType.Boolean },
        {
          displayName: 'Auto Resize',
          default: false,
          storyArgKey: 'autoResize',
          type: AddonParametersControlType.Boolean,
        },
        { displayName: 'Required', default: false, storyArgKey: 'required', type: AddonParametersControlType.Boolean },
      ],
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <cck-form-field style="width: 100%;">

        @if(cckControl.label) {
          <cck-label>{{cckControl.label}}</cck-label>
        }
        <textarea
          cckTextarea
          placeholder="{{cckControl.placeholder}}"
          [autoResize]="cckControl.autoResize"
          [minRows]="cckControl.minRows"
          [maxRows]="cckControl.maxRows"
          [required]="cckControl.required"
          [disabled]="cckControl.disabled"
          ${ngThemeArgsToTemplate(args)}
          >
        </textarea>
      </cck-form-field>
    `,
  }),
};
