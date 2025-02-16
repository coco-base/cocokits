import { IconButtonComponent } from '@cocokits/angular-button';
import { CCK_CONTROL, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Color: StoryObj<IconButtonComponent> = {
  name: 'Color',
  parameters: {
    docs: {
      description: {
        story: 'Color options enable seamless integration with various themes or to highlight specific actions.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp('color'), renderWithPageTab('Overview')],
      singleControls: ['type'],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
          <% themeComponentConfig.color.values.map(color => { %>
            <button
              icon-cck-button
              <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
              color='<%= color %>'
            >
                <cck-svg-icon [icon]="YOU_ICON"></cck-svg-icon>
            </button>
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
        <button cck-icon-button [type]="cckControl.type" [color]="color">
          <cck-svg-icon [icon]="cckIcons.heartFill"></cck-svg-icon>
        </button>
      }
    `,
  }),
};
