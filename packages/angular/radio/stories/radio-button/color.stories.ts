import { AngularStoryObj } from '@cocokits/internal-model';
import { AddonParametersControlType, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';

import { RadioButtonComponent } from '../../src';

export const Color: AngularStoryObj<RadioButtonComponent> = {
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
      controls: [{ prop: 'type', type: AddonParametersControlType.SelectThemeConfig }],
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
