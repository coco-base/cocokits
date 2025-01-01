import { AngularStoryObj } from '@cocokits/internal-model';
import { AddonParametersControlType, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';

import { RadioButtonComponent } from '../../src';

export const Size: AngularStoryObj<RadioButtonComponent> = {
  name: 'Size',
  parameters: {
    docs: {
      description: {
        story:
          'The size is adjustable to suit different design needs and screen dimensions, improving both aesthetics and usability.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp('size'), renderWithPageTab('Overview')],
      singleControls: ['type'],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
          <% themeComponentConfig.size.values.map(size => { %>
            <cck-radio-group
              <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
              size="<%= size %>"
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
      @for (size of cckControl.themeComponentConfig.size.values; let col = $index; track size) {
        <cck-radio-group
          [type]="cckControl.type"
          [size]="size">
            <cck-radio-button value="Radio-1">{{cckControl.type}} Radio Button 1</cck-radio-button>
            <cck-radio-button value="Radio-2">{{cckControl.type}} Radio Button 2</cck-radio-button>
            <cck-radio-button value="Radio-3">{{cckControl.type}} Radio Button 3</cck-radio-button>
        </cck-radio-group>
      }
    `,
  }),
};
