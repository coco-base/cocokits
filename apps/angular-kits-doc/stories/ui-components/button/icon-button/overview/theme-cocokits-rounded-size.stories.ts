import { IconButtonComponent } from '@cocokits/angular-button';
import { CCK_CONTROL, renderWithPageTab, renderWithThemeId, ThemeId } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const ThemeCocokitsRoundedSize: StoryObj<IconButtonComponent> = {
  name: 'Theme Cocokits: Rounded - Size',
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
            <% themeComponentConfig.size.values.map(size => { %>
              <button
                icon-cck-button
                <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                size='<%= size %>'
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
      @for (size of cckControl.themeComponentConfig.size.values; let col = $index; track size) {
        <button cck-icon-button [type]="cckControl.type" [size]="size" data-cck-rounded="true">
          <cck-svg-icon [icon]="cckIcons.heartFill"></cck-svg-icon>
        </button>
      }
    `,
  }),
};
