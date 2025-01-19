import { ButtonComponent } from '@cocokits/angular-button';
import { renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Type: StoryObj<ButtonComponent> = {
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
            <button
              cck-button
              type='<%= type %>'
            >
              <%= type %>
            </button>
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
      @for (type of cckControl.themeComponentConfig?.type?.values; let col = $index; track type) {
        <button cck-button [type]="type">{{type}}</button>
      }
    `,
  }),
};
