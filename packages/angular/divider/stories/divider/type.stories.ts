import { AngularStoryObj } from '@cocokits/internal-model';
import { renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';

import { DividerComponent } from '../../src/lib/divider/divider.component';

export const Type: AngularStoryObj<DividerComponent> = {
  name: 'Type',
  tags: ['uiBaseComponentName:divider', 'uiBaseComponentPropName:type'],
  parameters: {
    docs: {
      description: {
        story:
          'Displays variations in appearance and functionality, demonstrating how different types can be used to create unique button styles.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Overview'), renderWithThemeProp('type')],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
          <% themeComponentConfig.type.values.map(type => { %>
            <cck-divider type='<%= type %>'></cck-divider>
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
        <div style="flex:1; display: flex; justify-content: center; align-items: center; height: 100%; width: 100%;">
          <cck-divider style="margin: 0 auto" [type]="type"></cck-divider>
        </div>
      }
    `,
  }),
};
