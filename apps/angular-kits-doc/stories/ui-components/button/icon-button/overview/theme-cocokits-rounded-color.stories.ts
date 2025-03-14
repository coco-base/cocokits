import { IconButtonComponent } from '@cocokits/angular-button';
import { CCK_CONTROL, renderWithPageTab, renderWithThemeId, ThemeId } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const ThemeCocokitsRoundedColor: StoryObj<IconButtonComponent> = {
  name: 'Theme Cocokits: Rounded - Color',
  parameters: {
    docs: {
      description: {
        story: '',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeId(ThemeId.CocoKits), renderWithPageTab('Overview')],
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
                data-cck-rounded="true"
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
        <button cck-icon-button [type]="cckControl.type" [color]="color" data-cck-rounded="true">
          <cck-svg-icon [icon]="cckIcons.heartFill"></cck-svg-icon>
        </button>
      }
    `,
  }),
};
