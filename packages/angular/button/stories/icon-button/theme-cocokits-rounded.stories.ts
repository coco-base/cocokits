import { AngularStoryObj } from '@cocokits/internal-model';
import { renderWithPageTab, renderWithThemeId, ThemeId } from '@cocokits/storybook-addon-theme';

import { IconButtonComponent } from '../../src/lib/icon-button/icon-button.component';

export const ThemeCocokitsRounded: AngularStoryObj<IconButtonComponent> = {
  name: 'Theme Cocokits: Rounded',
  parameters: {
    docs: {
      description: {
        story:
          "This story presents the IconButtonComponent in its rounded form, showcasing how the button's appearance can be customized to provide a softer, circular style",
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeId(ThemeId.CocoKits), renderWithPageTab('Overview')],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
            <% themeComponentConfig.type.values.map(type => { %>
              <button cck-icon-button type='<%= type %>' data-cck-rounded="true">
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
      <@for (type of cckControl.themeComponentConfig?.type?.values; let col = $index; track type) {
        <button cck-icon-button [type]="type" data-cck-rounded="true">
          <cck-svg-icon [icon]="cckIcons.heartFill"></cck-svg-icon>
        </button>
      }
    `,
  }),
};
