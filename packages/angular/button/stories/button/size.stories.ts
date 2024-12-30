import { AngularStoryObj } from '@cocokits/internal-model';
import { AddonParametersControlType, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';

import { ButtonComponent } from '../../src/lib/button/button.component';

export const Size: AngularStoryObj<ButtonComponent> = {
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
            <button cck-button type='<%= type %>' size='<%= size %>'>Button - <%= size %></button>
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
      @for (size of cckControl.themeComponentConfig?.size?.values; let col = $index; track size) {
        <button cck-button [type]="cckControl.type" [size]="size">Button - {{size}}</button>
      }
    `,
  }),
};
