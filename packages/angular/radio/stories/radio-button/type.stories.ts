import { AngularStoryObj } from '@cocokits/internal-model';
import { renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { RadioButtonComponent } from '../../src';

export const Type: AngularStoryObj<RadioButtonComponent> = {
  name: 'Type',
  parameters: {
    docs: {
      description: {
        story:
          'Displays variations in appearance and functionality, demonstrating how different types can be used to create unique button styles.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp('type'), renderWithPageTab('Overview')],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
          <% themeComponentConfig.type.values.map(type => { %>
            <cck-radio-button type='<%= type %>' [value]="YOUR_VALUE">Radio Button - {{type}}</cck-radio-button>
          <% }) %>
          `,
        },
      ],
    },
  },
  render: (args) => ({
    props: {
      ...args,
      themeComponentConfig: getSelectedCckTheme()?.themeConfig.components,
    },
    template: `
      @for (type of cckControl.themeComponentConfig?.type?.values; let col = $index; track type) {
        <cck-radio-button [type]="type" [value]="1">Radio Button - {{type}}</cck-radio-button>
      }
    `,
  }),
};
