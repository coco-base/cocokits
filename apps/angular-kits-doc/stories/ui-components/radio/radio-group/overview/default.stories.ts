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
            <cck-radio-group
              <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
              <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
              <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
              <% if (selectedRadio !== 'None') { %> selected='<%= selectedRadio %>' <% } %>
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
        CCK_CONTROL.type(),
        CCK_CONTROL.color(),
        CCK_CONTROL.size(),
        CCK_CONTROL.additional(),
        CCK_CONTROL.selectedRadio(),
        CCK_CONTROL.disabled(false),
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
        [selected]="cckControl.selectedRadio"
        ${ngThemeArgsToTemplate(args)}>
          <cck-radio-button value="Radio-1">Radio Button 1</cck-radio-button>
          <cck-radio-button value="Radio-2">Radio Button 2</cck-radio-button>
          <cck-radio-button value="Radio-3">Radio Button 3</cck-radio-button>
      </cck-radio-group>
    `,
  }),
};
