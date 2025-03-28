import { RadioButtonComponent } from '@cocokits/angular-radio';
import { CCK_CONTROL, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Color: StoryObj<RadioButtonComponent> = {
  name: 'Color',
  parameters: {
    docs: {
      description: {
        story: 'Color options enable seamless integration with various themes or to highlight specific actions.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp('color'), renderWithPageTab('Overview')],
      singleControls: ['type'],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
          @for (color of cckControl.themeComponentConfig.color.values; let col = $index; track color) {
            <cck-radio-button [type]="cckControl.type" [color]="color" [value]="1">Radio Button - {{color}}</cck-radio-button>
          }
          <% themeComponentConfig.color.values.map(color => { %>
            <cck-radio-button
              <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
              color='<%= color %>'
              [value]="YOUR_VALUE"
            >
            Radio Button - <%= color %>
            </cck-radio-button>
          <% }) %>
          `,
        },
      ],
      controls: [CCK_CONTROL.type()],
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      @for (color of cckControl.themeComponentConfig.color.values; let col = $index; track color) {
        <cck-radio-button [type]="cckControl.type" [color]="color" [value]="1">Radio Button - {{color}}</cck-radio-button>
      }
    `,
  }),
};
