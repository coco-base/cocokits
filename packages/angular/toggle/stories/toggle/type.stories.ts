import { AngularStoryObj } from '@cocokits/internal-model';
import { renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';

import { ToggleComponent } from '../../src/lib/toggle/toggle.component';

export const Type: AngularStoryObj<ToggleComponent> = {
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
            <cck-toggle type="<%= type %>">Slide Me!</cck-toggle>
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
        <cck-toggle [type]="type">{{type}}</cck-toggle>
      }
    `,
  }),
};
