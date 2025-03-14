import { InputComponent } from '@cocokits/angular-form-field';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { ngThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Default: StoryObj<InputComponent> = {
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
        CCK_CONTROL.label('Label'),
        CCK_CONTROL.placeholder('Placeholder'),
        CCK_CONTROL.inputNativeType(),
        CCK_CONTROL.color(),
        CCK_CONTROL.size(),
        CCK_CONTROL.additional(),
        CCK_CONTROL.disabled(),
        CCK_CONTROL.required(false),
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
            [type]="cckControl.type"
            [size]="cckControl.size"
            [color]="cckControl.color"
            [placeholder]="cckControl.placeholder"
            [required]="cckControl.required"
            [disabled]="cckControl.disabled"
            ${ngThemeArgsToTemplate(args)}
          />
      </cck-form-field>
    `,
  }),
};
