import { ToggleComponent } from '@cocokits/angular-toggle';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { ngThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-angular';

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
        CCK_CONTROL.text('Slid Me!'),
        CCK_CONTROL.labelPosition(),
        CCK_CONTROL.type(),
        CCK_CONTROL.color(),
        CCK_CONTROL.size(),
        CCK_CONTROL.additional(),
        CCK_CONTROL.disabled(false),
        CCK_CONTROL.checked(false),
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
