import { SelectComponent } from '@cocokits/angular-form-field';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { ngThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Default: StoryObj<SelectComponent> = {
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
        CCK_CONTROL.label('Label'),
        CCK_CONTROL.placeholder('Placeholder'),
        CCK_CONTROL.type(),
        CCK_CONTROL.color(),
        CCK_CONTROL.size(),
        CCK_CONTROL.additional(),
        CCK_CONTROL.disabled(),
        CCK_CONTROL.multiple(false),
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
