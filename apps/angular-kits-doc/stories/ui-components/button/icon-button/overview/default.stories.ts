import { IconButtonComponent } from '@cocokits/angular-button';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { ngThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Default: StoryObj<IconButtonComponent> = {
  name: 'Default',
  parameters: {
    docs: {
      description: {
        story:
          'Shows the default example with no additional configurations, providing an interactive example in its most basic form.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Overview')],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
              <button
                cck-icon-button
                <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
                <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
                <% if (disabled) { %> disabled <% } %>>
                  <cck-svg-icon [icon]="YOUR_ICON"></cck-svg-icon>
              </button>
              `,
        },
      ],
      hasControl: true,
      controls: [
        CCK_CONTROL.icon('heartFill'),
        CCK_CONTROL.type(),
        CCK_CONTROL.color(),
        CCK_CONTROL.size(),
        CCK_CONTROL.additional(),
        CCK_CONTROL.disabled(false),
      ],
    },
  },
  render: (args) => {
    return {
      props: {
        ...args,
      },
      template: `
      <button
        cck-icon-button
        [disabled]="cckControl.disabled"
        ${ngThemeArgsToTemplate(args)}>
          <cck-svg-icon [icon]="cckIcons[cckControl.icon]"></cck-svg-icon>
      </button>
    `,
    };
  },
};
