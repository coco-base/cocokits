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
          <% themeComponentConfig.color.values.map(color => { %>
            <cck-radio-group
              <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
              color="<%= color %>"
            >
              <cck-radio-button value="Radio-1">Radio Button 1</cck-radio-button>
              <cck-radio-button value="Radio-2">Radio Button 2</cck-radio-button>
              <cck-radio-button value="Radio-3">Radio Button 3</cck-radio-button>
            </cck-radio-group>
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
        <cck-radio-group
          [type]="cckControl.type"
          [color]="color">
            <cck-radio-button value="Radio-1">Radio Button 1</cck-radio-button>
            <cck-radio-button value="Radio-2">Radio Button 2</cck-radio-button>
            <cck-radio-button value="Radio-3">Radio Button 3</cck-radio-button>
        </cck-radio-group>
      }
    `,
  }),
};
