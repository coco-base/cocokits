import { RadioButtonComponent } from '@cocokits/angular-radio';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { ngThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Default: StoryObj<RadioButtonComponent> = {
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
            <cck-radio-button
              [checked]="<%= checked %>"
              <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
              <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
              <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
              <% if (disabled) { %> disabled <% } %>
              [value]="YOUR_VALUE"
            >
              {{cckControl.text}}
            </cck-radio-button>
          `,
        },
      ],
      hasControl: true,
      controls: [
        CCK_CONTROL.text('label'),
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
      <cck-radio-button
        [checked]="cckControl.checked"
        [disabled]="cckControl.disabled"
        [value]="1"
        ${ngThemeArgsToTemplate(args)}
      >
        {{cckControl.text}}
      </cck-radio-button>
    `,
  }),
};
