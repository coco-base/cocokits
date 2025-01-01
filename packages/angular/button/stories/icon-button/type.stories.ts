import { AngularStoryObj } from '@cocokits/internal-model';
import { renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';

import { ButtonComponent } from '../../src/lib/button/button.component';

export const Type: AngularStoryObj<ButtonComponent> = {
  name: 'Type',
  parameters: {
    docs: {
      description: {
        story:
          'Displays variations in appearance and functionality, demonstrating how different types can be used to create unique icon-button styles.',
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
              <button icon-cck-button type='<%= type %>'>
                <cck-svg-icon [icon]="YOUR_ICON"></cck-svg-icon>
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
      @for (type of cckControl.themeComponentConfig.type.values; let col = $index; track type) {
        <button cck-icon-button [type]="type">
          <cck-svg-icon [icon]="cckIcons.heartFill"></cck-svg-icon>
        </button>
      }
    `,
  }),
};
