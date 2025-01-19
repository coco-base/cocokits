import { RadioButtonComponent } from '@cocokits/angular-radio';
import { renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Type: StoryObj<RadioButtonComponent> = {
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
              <cck-radio-group type="<%= type %>">
                <cck-radio-button value="Radio-1">Radio Button 1</cck-radio-button>
                <cck-radio-button value="Radio-2">Radio Button 2</cck-radio-button>
                <cck-radio-button value="Radio-3">Radio Button 3</cck-radio-button>
              </cck-radio-group>
            <% }) %>
          `,
        },
      ],
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
       @for (type of cckControl.themeComponentConfig.type.values; let col = $index; track type) {
        <cck-radio-group [type]="type" [selected]="1">
          <cck-radio-button value="Radio-1">Radio Button 1</cck-radio-button>
          <cck-radio-button value="Radio-2">Radio Button 2</cck-radio-button>
          <cck-radio-button value="Radio-3">Radio Button 3</cck-radio-button>
        </cck-radio-group>
      }
    `,
  }),
};
