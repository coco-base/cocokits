import { AddonParametersControlType, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

import { RadioButtonComponent } from '../../src';

export const Size: StoryObj<RadioButtonComponent> = {
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
          @for (size of cckControl.themeComponentConfig.size.values; let col = $index; track size) {
            <cck-radio-button [type]="cckControl.type" [size]="size" [value]="1">Radio Button - {{size}}</cck-radio-button>
          }
          <% themeComponentConfig.size.values.map(size => { %>
            <cck-radio-button
              <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
              size='<%= size %>'
              [value]="YOUR_VALUE"
            >
            Radio Button - <%= size %>
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
      @for (size of cckControl.themeComponentConfig.size.values; let col = $index; track size) {
        <cck-radio-button [type]="cckControl.type" [size]="size" [value]="1">Radio Button - {{size}}</cck-radio-button>
      }
    `,
  }),
};
