import { CheckboxComponent } from '@cocokits/angular-checkbox';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { ngThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Default: StoryObj<CheckboxComponent> = {
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
        CCK_CONTROL.indeterminate(false),
        CCK_CONTROL.text('Checkbox Label'),
        CCK_CONTROL.type(),
        CCK_CONTROL.color(),
        CCK_CONTROL.size(),
        CCK_CONTROL.additional(),
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
