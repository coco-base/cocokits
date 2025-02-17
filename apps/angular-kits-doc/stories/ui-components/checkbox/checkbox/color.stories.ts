import { CheckboxComponent } from '@cocokits/angular-checkbox';
import { CCK_CONTROL, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Color: StoryObj<CheckboxComponent> = {
  name: 'Color',
  parameters: {
    docs: {
      description: {
        story: 'Color options enable seamless integration with various themes or to highlight specific actions.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Overview'), renderWithThemeProp('color')],
      singleControls: ['type'],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
            <% themeComponentConfig.color.values.map(color => { %>
              <cck-checkbox
                <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                color="<%= color %>"
              >
                Checkbox Label
              </cck-checkbox>
            <% }) %>
          `,
        },
      ],
      controls: [CCK_CONTROL.type()],
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      @for (color of cckControl.themeComponentConfig.color.values; let col = $index; track color) {
        <cck-checkbox [color]="color" [type]="cckControl.type" [checked]="true">Checkbox Label</cck-checkbox>
      }
    `,
  }),
};
